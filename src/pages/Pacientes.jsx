import { useState, useEffect } from 'react';
import { servicoPacientes } from '../services/pacientesService.js';
// ...existing imports...
import Modal from '../components/Modal';
import ModalAviso from '../components/ModalAviso';
import { Plus, Edit, Trash2, Search, User, Calendar, Pencil } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

const Pacientes = () => {
  const { showSidebarButton } = useOutletContext();
  const [pacientes, setPacientes] = useState([]);
  const [pacientesFiltrados, setPacientesFiltrados] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [avisoAberto, setAvisoAberto] = useState(false);
  const [avisoMsg, setAvisoMsg] = useState('');
  const [pacienteEditando, setPacienteEditando] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [dadosFormulario, setDadosFormulario] = useState({
    nome: '',
    email: '',
    telefone: '',
    endereco: '',
    data_nascimento: '',
    observacoes: ''
  });
  const [arquivos, setArquivos] = useState([]);
  const [arquivoExistente, setArquivoExistente] = useState(null);

  useEffect(() => {
    carregarPacientes();
  }, []);

  useEffect(() => {
    if (termoBusca) {
      setPacientesFiltrados(
        pacientes.filter(paciente =>
          (paciente.nome || '').toLowerCase().includes(termoBusca.toLowerCase()) ||
          (paciente.email || '').toLowerCase().includes(termoBusca.toLowerCase()) ||
          (paciente.telefone || '').includes(termoBusca)
        )
      );
    } else {
      setPacientesFiltrados(pacientes);
    }
  }, [termoBusca, pacientes]);

  const carregarPacientes = async () => {
    try {
      const dados = await servicoPacientes.buscarPacientes();
      setPacientes(dados);
      setPacientesFiltrados(dados);
    } catch (erro) {
      console.error('Erro ao carregar pacientes:', erro);
    } finally {
      setCarregando(false);
    }
  };

  const aoSubmeter = async (e) => {
    e.preventDefault();
    // Validação: paciente deve ter pelo menos 4 anos
    if (dadosFormulario.data_nascimento) {
      const hoje = new Date();
      const nascimento = new Date(dadosFormulario.data_nascimento);
      const idade = hoje.getFullYear() - nascimento.getFullYear() - (hoje < new Date(hoje.getFullYear(), nascimento.getMonth(), nascimento.getDate()) ? 1 : 0);
      if (idade < 4) {
        setAvisoMsg('Não é possível cadastrar pacientes com menos de 4 anos de idade.');
        setAvisoAberto(true);
        return;
      }
    }
    try {
      const pacientePayload = { ...dadosFormulario };
      let pacienteSalvo;
      if (pacienteEditando) {
        pacienteSalvo = await servicoPacientes.atualizarPaciente(pacienteEditando.id, pacientePayload);
      } else {
        pacienteSalvo = await servicoPacientes.criarPaciente(pacientePayload);
      }
      // Upload de arquivos se houver
      if (arquivos.length > 0) {
        const formData = new FormData();
        arquivos.forEach((file) => formData.append('arquivos', file));
        await servicoPacientes.uploadArquivos((pacienteSalvo.id || pacienteEditando.id), formData);
      }
      setModalAberto(false);
      setPacienteEditando(null);
      setDadosFormulario({
        nome: '',
        email: '',
        telefone: '',
        endereco: '',
        data_nascimento: '',
        observacoes: ''
      });
      setArquivos([]);
      carregarPacientes();
    } catch (erro) {
      console.error('Erro ao salvar paciente:', erro);
    }
  };

  const aoEditar = (paciente) => {
    setPacienteEditando(paciente);
    setDadosFormulario({
      nome: paciente.nome || '',
      email: paciente.email || '',
      telefone: paciente.telefone || '',
      endereco: paciente.endereco || '',
      data_nascimento: paciente.data_nascimento ? paciente.data_nascimento.split('T')[0] : '',
      observacoes: paciente.observacoes || ''
    });
    // Busca arquivo existente do paciente
    servicoPacientes.listarArquivos(paciente.id).then(arquivos => {
      if (arquivos && arquivos.length > 0) {
        setArquivoExistente(arquivos[0]);
        setArquivos([]); // Não preenche input file
      } else {
        setArquivoExistente(null);
        setArquivos([]);
      }
    });
    setModalAberto(true);
  };

  const aoExcluir = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este paciente?')) {
      try {
        await servicoPacientes.excluirPaciente(id);
        carregarPacientes();
      } catch (erro) {
        console.error('Erro ao excluir paciente:', erro);
      }
    }
  };


  // Função para formatar telefone (99) 99999-9999
  function formatarTelefone(valor) {
    const limpo = valor.replace(/\D/g, '');
    if (limpo.length <= 2) return limpo;
    if (limpo.length <= 7) return `(${limpo.slice(0,2)}) ${limpo.slice(2)}`;
    return `(${limpo.slice(0,2)}) ${limpo.slice(2,7)}-${limpo.slice(7,11)}`;
  }

  if (carregando) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-500 dark:text-gray-400">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className={`text-2xl font-bold text-gray-900 dark:text-white ${showSidebarButton ? 'ml-14' : ''} lg:ml-0`}>
          Pacientes
        </h1>
        <button
          onClick={() => setModalAberto(true)}
          className="btn btn-primary px-4 py-2 text-sm font-medium"
        >
          <Plus size={20} className="mr-2" />
          Novo Paciente
        </button>
      </div>

      {/* Busca */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar pacientes..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Lista de Pacientes */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Lista de Pacientes ({pacientesFiltrados.length})
        </h2>
        {pacientesFiltrados.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            {termoBusca ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
          </p>
        ) : (
          <div className="space-y-4">
            {pacientesFiltrados.map((paciente) => (
              <div
                key={paciente.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-primary-100 dark:bg-primary-900 p-2 rounded-lg">
                    <User className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {paciente.nome}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {paciente.email}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {paciente.telefone}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => aoEditar(paciente)}
                    className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => aoExcluir(paciente.id)}
                    className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalAberto}
        onClose={() => {
          setModalAberto(false);
          setPacienteEditando(null);
          setDadosFormulario({
            nome: '',
            email: '',
            telefone: '',
            endereco: '',
            data_nascimento: '',
            observacoes: ''
          });
        }}
        title={pacienteEditando ? 'Editar Paciente' : 'Novo Paciente'}
      >
        <form onSubmit={aoSubmeter} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nome Completo
            </label>
            <input
              type="text"
              value={dadosFormulario.nome}
              onChange={(e) => setDadosFormulario({ ...dadosFormulario, nome: e.target.value })}
              className="input"
              required
            />
          </div>
          {/* ...existing fields... */}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={dadosFormulario.email}
                onChange={(e) => setDadosFormulario({ ...dadosFormulario, email: e.target.value })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Telefone
              </label>
              <input
                type="tel"
                value={dadosFormulario.telefone}
                onChange={(e) => setDadosFormulario({ ...dadosFormulario, telefone: formatarTelefone(e.target.value) })}
                className="input"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Endereço
            </label>
            <input
              type="text"
              value={dadosFormulario.endereco}
              onChange={(e) => setDadosFormulario({ ...dadosFormulario, endereco: e.target.value })}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Data de Nascimento
            </label>
            <div className="relative w-36">
              <input
                type="date"
                value={dadosFormulario.data_nascimento}
                onChange={(e) => setDadosFormulario({ ...dadosFormulario, data_nascimento: e.target.value })}
                className="input pr-8 appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 text-base"
                required
                ref={el => (window.pacienteDateInput = el)}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 p-0 m-0 border-0 bg-transparent focus:outline-none z-10"
                onClick={() => window.pacienteDateInput && window.pacienteDateInput.showPicker ? window.pacienteDateInput.showPicker() : window.pacienteDateInput && window.pacienteDateInput.focus()}
                tabIndex={0}
                aria-label="Selecionar data de nascimento"
                style={{lineHeight:0}}
              >
                <Calendar className={`h-5 w-5 ${document.documentElement.classList.contains('dark') ? 'text-white' : 'text-blue-600'}`} />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Observações
            </label>
            <textarea
              value={dadosFormulario.observacoes}
              onChange={(e) => setDadosFormulario({ ...dadosFormulario, observacoes: e.target.value })}
              className="input"
              rows="3"
              placeholder="Observações sobre o paciente..."
            />
          </div>

          <div className="flex flex-col items-start">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ficha</label>
            <div
              className="w-28 h-28 flex items-center justify-center border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 hover:border-blue-500 transition relative"
              onClick={() => document.getElementById('ficha-upload').click()}
            >
              {(arquivos.length === 0 && !arquivoExistente) ? (
                <Plus className="w-10 h-10 text-blue-500" />
              ) : (
                <Pencil className="w-10 h-10 text-blue-500" />
              )}
              <input
                id="ficha-upload"
                type="file"
                accept=".txt,.pdf,.csv,.xls,.xlsx"
                style={{ display: 'none' }}
                onChange={e => {
                  setArquivos(Array.from(e.target.files));
                  setArquivoExistente(null); // Se selecionar novo arquivo, some o antigo
                }}
              />
              {arquivos.length > 0 && (
                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-gray-700 dark:text-gray-300 text-center w-24 truncate">{arquivos[0].name}</span>
              )}
              {arquivos.length === 0 && arquivoExistente && (
                <>
                  <span
                    className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-blue-600 dark:text-blue-400 text-center w-24 truncate underline cursor-pointer"
                    title="Clique para baixar"
                  >
                    {arquivoExistente.nome_arquivo}
                  </span>
                  <button
                    type="button"
                    className="absolute top-2 right-2 bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs shadow"
                    onClick={async e => {
                      e.stopPropagation();
                      const token = localStorage.getItem('token');
                      const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/pacientes/${pacienteEditando.id}/arquivos/${arquivoExistente.id}`;
                      try {
                        const response = await fetch(url, {
                          headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (!response.ok) throw new Error('Erro ao baixar arquivo');
                        const blob = await response.blob();
                        const link = document.createElement('a');
                        link.href = window.URL.createObjectURL(blob);
                        link.download = arquivoExistente.nome_arquivo;
                        document.body.appendChild(link);
                        link.click();
                        link.remove();
                      } catch (err) {
                        alert('Erro ao baixar arquivo');
                      }
                    }}
                  >
                    Baixar
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setModalAberto(false);
                setPacienteEditando(null);
              }}
              className="btn btn-secondary px-4 py-2 text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary px-4 py-2 text-sm"
            >
              {pacienteEditando ? 'Salvar' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Aviso */}
      <ModalAviso
        isOpen={avisoAberto}
        onClose={() => setAvisoAberto(false)}
        title="Cadastro Inválido"
        message={avisoMsg}
      />
    </div>
  );
};

export default Pacientes;