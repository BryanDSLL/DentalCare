import { useState, useEffect } from 'react';
import { servicoPacientes } from '../services/pacientesService.js';
import Modal from '../components/Modal';
import { Plus, Edit, Trash2, Search, User } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

const Pacientes = () => {
  const { showSidebarButton } = useOutletContext();
  const [pacientes, setPacientes] = useState([]);
  const [pacientesFiltrados, setPacientesFiltrados] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
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
    try {
      const pacientePayload = { ...dadosFormulario };
      if (pacienteEditando) {
        await servicoPacientes.atualizarPaciente(pacienteEditando.id, pacientePayload);
      } else {
        await servicoPacientes.criarPaciente(pacientePayload);
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
            <input
              type="date"
              value={dadosFormulario.data_nascimento}
              onChange={(e) => setDadosFormulario({ ...dadosFormulario, data_nascimento: e.target.value })}
              className="input"
            />
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
    </div>
  );
};

export default Pacientes;