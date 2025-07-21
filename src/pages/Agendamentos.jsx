import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { servicoConsultas } from '../services/consultasService.js';
import { servicoPacientes } from '../services/pacientesService.js';
import Modal from '../components/Modal';
import ModalAviso from '../components/ModalAviso';
import { Clock, Plus, Edit, Trash2, Calendar } from 'lucide-react';

const Agendamentos = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  // Data inicial: hoje, Data final: hoje + 7 dias
  const today = new Date();
  const formatDate = (d) => d.toISOString().split('T')[0];
  const defaultStart = formatDate(today);
  const defaultEnd = formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7));
  const [dateStart, setDateStart] = useState(defaultStart);
  const [dateEnd, setDateEnd] = useState(defaultEnd);
  const [theme, setTheme] = useState(document.documentElement.classList.contains('dark') ? 'dark' : 'light');

  // Atualiza o tema ao trocar
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [loading, setLoading] = useState(false); 
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    date: '',
    time: '',
    type: '',
    notes: '',
    status: 'Pendente' // novo campo de status
  });
  const [authError, setAuthError] = useState(null);
  const [statusMenuOpenId, setStatusMenuOpenId] = useState(null);
  const [statusFilters, setStatusFilters] = useState({ Pendente: true, Realizado: true, Cancelado: true });
  const [avisoAberto, setAvisoAberto] = useState(false);
  const [avisoMsg, setAvisoMsg] = useState('');
  const statusOptions = [
    { value: 'Pendente', label: 'Pendente', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' },
    { value: 'Realizado', label: 'Realizado', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
    { value: 'Cancelado', label: 'Cancelado', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' }
  ];
  // const [formErrors, setFormErrors] = useState({});
  const { showSidebarButton } = useOutletContext();

  const loadAppointmentsAsync = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      // Monta array de status selecionados
      const selectedStatus = Object.keys(statusFilters).filter(s => statusFilters[s]);
      const appointmentsData = await servicoConsultas.getAgendamentos(dateStart, dateEnd, selectedStatus);
      if (Array.isArray(appointmentsData)) {
        setAppointments(appointmentsData);
        // Log detalhado dos status recebidos
        console.log('Status dos agendamentos:', appointmentsData.map(a => a.status));
      } else {
        setAppointments([]);
        if (appointmentsData.error && (appointmentsData.error.includes('Token inválido') || appointmentsData.error.includes('Unauthorized'))) {
          setAuthError('Faça login para visualizar os agendamentos.');
        } else {
          setAuthError('Erro ao carregar agendamentos.');
        }
        console.error('Erro ao carregar agendamentos:', appointmentsData.error || appointmentsData);
      }
    } catch (error) {
      setAppointments([]);
      if (error.message && (error.message.includes('401') || error.message.includes('Unauthorized'))) {
        setAuthError('Faça login para visualizar os agendamentos.');
      } else {
        setAuthError('Erro ao carregar agendamentos.');
      }
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointmentsAsync();
    loadPatients();
    // eslint-disable-next-line
  }, [dateStart, dateEnd, statusFilters]);

  const loadPatients = async () => {
    try {
      const patientsData = await servicoPacientes.buscarPacientes();
      setPatients(patientsData);
    } catch (error) {
      console.error('Error loading patients:', error);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validação: não permitir datas/horas passadas
    const now = new Date();
    const dataSelecionada = new Date(`${formData.date}T${formData.time}:00`);
    if (dataSelecionada < now && !editingAppointment) {
      setAvisoMsg('Não é possível agendar uma consulta para uma data e hora que já passaram.');
      setAvisoAberto(true);
      return;
    }
    try {
      const appointmentData = {
        idpaciente: formData.patientId,
        data: `${formData.date}T${formData.time}:00`,
        tipo: formData.type,
        notas: formData.notes,
        status: formData.status // inclui status
      };
      if (editingAppointment) {
        await servicoConsultas.updateAgendamento(editingAppointment.id, appointmentData);
      } else {
        await servicoConsultas.createAgendamento(appointmentData);
      }
      setIsModalOpen(false);
      setEditingAppointment(null);
      setFormData({
        patientId: '',
        patientName: '',
        date: '',
        time: '',
        type: '',
        notes: '',
        status: 'Pendente'
      });
      // Atualiza agendamentos para a data selecionada
      await loadAppointmentsAsync();
    } catch (error) {
      console.error('Error saving appointment:', error);
    }
  };

  const handleEdit = (appointment) => {
    setEditingAppointment(appointment);
    // Ajusta para backend: data é string ou Date
    let appointmentDate;
    if (appointment.data instanceof Date) {
      appointmentDate = appointment.data;
    } else if (typeof appointment.data === 'string') {
      appointmentDate = new Date(appointment.data);
    } else {
      appointmentDate = new Date(); // fallback
    }
    setFormData({
      patientId: appointment.idpaciente || '',
      patientName: '', // será preenchido pelo select
      date: appointmentDate.toISOString().split('T')[0],
      time: appointmentDate.toTimeString().slice(0, 5),
      type: appointment.tipo || '',
      notes: appointment.notas || '',
      status: appointment.status || 'Pendente' // preenche o status
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja cancelar esta consulta?')) {
      try {
        await servicoConsultas.deleteAgendamento(id);
        await loadAppointmentsAsync();
      } catch (error) {
        console.error('Error deleting appointment:', error);
      }
    }
  };

  const handlePatientChange = (e) => {
    const patientId = e.target.value;
    const patient = patients.find(p => p.id === patientId);
    setFormData({
      ...formData,
      patientId,
      patientName: patient ? patient.nome : ''
    });
  };

  const formatDateTime = (date) => {
    let dateObj;
    if (typeof date === 'string') {
      dateObj = parseDateLocal(date);
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      dateObj = new Date(date);
    }
    return {
      date: dateObj.toLocaleDateString('pt-BR'),
      time: dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  function parseDateLocal(dateString) {
    if (/Z$/i.test(dateString)) {
      const d = new Date(dateString);
      d.setHours(d.getHours() - 3);
      return d;
    }
    const clean = dateString.replace(/Z|\+\d{2}:?\d{2}$/i, '');
    const [datePart, timePart] = clean.replace('T', ' ').split(' ');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour = 0, min = 0, sec = 0] = (timePart || '').split(':').map(Number);
    return new Date(year, month - 1, day, hour, min, sec);
  }

  // O backend já retorna apenas os agendamentos do período, não precisa filtrar aqui
  const filteredAppointments = appointments;

  // Responsividade: detecta se é mobile
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fecha o menu de status ao clicar fora
  useEffect(() => {
    if (statusMenuOpenId === null) return;
    function handleClickOutside(e) {
      const btn = document.getElementById(`status-btn-${statusMenuOpenId}`);
      const menu = document.querySelector(`#status-menu-${statusMenuOpenId}`);
      if (btn && btn.contains(e.target)) return;
      if (menu && menu.contains(e.target)) return;
      setStatusMenuOpenId(null);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [statusMenuOpenId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-500 dark:text-gray-400">Carregando...</div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64">
        <div className="text-red-600 dark:text-red-400 font-semibold text-lg mb-2">{authError}</div>
        <button
          className="btn btn-primary px-4 py-2 text-sm"
          onClick={() => window.location.href = '/login'}
        >
          Fazer Login
        </button>
      </div>
    );
  }

  // Função para decidir se o menu deve abrir acima ou abaixo do botão
  function getShouldOpenAbove(id) {
    if (typeof window === 'undefined') return false;
    const btn = document.getElementById(`status-btn-${id}`);
    const spaceBelow = btn ? window.innerHeight - btn.getBoundingClientRect().bottom : 999;
    return spaceBelow < 140;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className={`text-2xl font-bold text-gray-900 dark:text-white ${showSidebarButton ? 'ml-14' : ''} lg:ml-0`}>Agenda</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary px-4 py-2 text-sm font-medium"
        >
          <Plus size={20} className="mr-2" />
          Nova Consulta
        </button>
      </div>

      {/* Date Range Filter */}
      <div className="card">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col">
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Data Inicial</label>
            <div className="relative">
              <input
                type="date"
                value={dateStart}
                max={dateEnd}
                onChange={e => setDateStart(e.target.value)}
                className="input w-40 pr-10 hide-date-icon bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                ref={el => (window.dateStartInput = el)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-transparent p-0 m-0 border-0 focus:outline-none"
                onClick={() => window.dateStartInput && window.dateStartInput.showPicker ? window.dateStartInput.showPicker() : window.dateStartInput && window.dateStartInput.focus()}
                aria-label="Selecionar data inicial"
                tabIndex={0}
                style={{lineHeight:0}}
              >
                <Calendar className={`h-5 w-5 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`} />
              </button>
            </div>
          </div>
          <div className="flex flex-col">
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Data Final</label>
            <div className="relative">
              <input
                type="date"
                value={dateEnd}
                min={dateStart}
                onChange={e => setDateEnd(e.target.value)}
                className="input w-40 pr-10 hide-date-icon bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                ref={el => (window.dateEndInput = el)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-transparent p-0 m-0 border-0 focus:outline-none"
                onClick={() => window.dateEndInput && window.dateEndInput.showPicker ? window.dateEndInput.showPicker() : window.dateEndInput && window.dateEndInput.focus()}
                aria-label="Selecionar data final"
                tabIndex={0}
                style={{lineHeight:0}}
              >
                <Calendar className={`h-5 w-5 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`} />
              </button>
            </div>
          </div>
          {/* Filtros de status */}
          <div className="flex flex-col gap-1 ml-2">
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Status</label>
            <div className="flex gap-2">
              {['Pendente', 'Realizado', 'Cancelado'].map(status => (
                <label key={status} className="flex items-center gap-1 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={statusFilters[status]}
                    onChange={e => {
                      setStatusFilters(f => ({ ...f, [status]: e.target.checked }));
                    }}
                    className="accent-current"
                  />
                  <span className={
                    status === 'Realizado' ? 'text-green-700 dark:text-green-300' :
                    status === 'Cancelado' ? 'text-red-700 dark:text-red-300' :
                    'text-yellow-700 dark:text-yellow-300'
                  }>{status}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Consultas de {dateStart.split('-').reverse().join('/')} até {dateEnd.split('-').reverse().join('/')}
        </h2>
        {filteredAppointments.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            Nenhuma consulta agendada para esta data
          </p>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => {
              const { time } = formatDateTime(appointment.data);
              const patient = patients.find(p => p.id === appointment.idpaciente);
              return (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-primary-100 dark:bg-primary-900 p-2 rounded-lg">
                      <Clock size={20} className="text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {patient ? patient.nome : 'Paciente'}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(appointment.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {time} - {appointment.tipo}
                      </p>
                      {appointment.notas && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {appointment.notas}
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Layout responsivo: mobile (vertical), desktop (horizontal) */}
                  <div
                    className={
                      isMobile
                        ? 'flex flex-col items-end space-y-2' // Mobile: coluna, botão em cima
                        : 'flex items-center space-x-2' // Desktop: linha
                    }
                  >
                    {/* Botão de status */}
                    <div className="relative inline-block">
                      <button
                        type="button"
                        className={`px-4 py-2 min-w-[90px] text-xs rounded font-semibold focus:outline-none transition-all shadow-sm border border-gray-200 dark:border-gray-700
    ${appointment.status === 'Realizado' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : appointment.status === 'Cancelado' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'}`}
                        onClick={() => setStatusMenuOpenId(statusMenuOpenId === appointment.id ? null : appointment.id)}
                        aria-label="Alterar status"
                        id={`status-btn-${appointment.id}`}
                      >
                        {appointment.status || 'Pendente'}
                      </button>
                      {statusMenuOpenId === appointment.id && (
                        <div
                          id={`status-menu-${appointment.id}`}
                          className={`absolute left-0 z-20 bg-white dark:bg-gray-800 rounded shadow-lg border border-gray-200 dark:border-gray-700 w-36`}
                          style={{
                            top: getShouldOpenAbove(appointment.id) ? 'auto' : '100%',
                            bottom: getShouldOpenAbove(appointment.id) ? '100%' : 'auto',
                            left: 0,
                            right: 'auto',
                            minWidth: '90px',
                          }}
                        >
                          {statusOptions.map(option => (
                            <button
                              key={option.value}
                              className={`block w-full text-left px-3 py-2 text-xs font-semibold bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 ${option.value === 'Realizado' ? 'text-green-700 dark:text-green-300' : option.value === 'Cancelado' ? 'text-red-700 dark:text-red-300' : 'text-yellow-700 dark:text-yellow-300'} hover:opacity-80 focus:outline-none ${appointment.status === option.value ? 'ring-2 ring-primary-500' : ''}`}
                              onClick={async () => {
                                await servicoConsultas.updateAgendamento(appointment.id, { ...appointment, status: option.value });
                                setStatusMenuOpenId(null);
                                await loadAppointmentsAsync();
                              }}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Ícones de editar/excluir */}
                    <div className={isMobile ? 'flex items-center space-x-2 mt-2' : 'flex items-center space-x-2'}>
                      <button
                        onClick={() => handleEdit(appointment)}
                        className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(appointment.id)}
                        className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAppointment(null);
          setFormData({
            patientId: '',
            patientName: '',
            date: '',
            time: '',
            type: '',
            notes: '',
            status: 'Pendente'
          });
        }}
        title={editingAppointment ? 'Editar Consulta' : 'Nova Consulta'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Paciente
            </label>
            <select
              value={formData.patientId}
              onChange={handlePatientChange}
              className="input"
              required
            >
              <option value="">Selecione um paciente</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Data
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="input pr-10 appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0"
                  required
                  ref={el => (window.modalDateInput = el)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 p-0 m-0 border-0 bg-transparent focus:outline-none"
                  onClick={() => window.modalDateInput && window.modalDateInput.showPicker ? window.modalDateInput.showPicker() : window.modalDateInput && window.modalDateInput.focus()}
                  tabIndex={0}
                  aria-label="Selecionar data"
                >
                  <Calendar className={`h-5 w-5 ${theme === 'dark' ? 'text-white' : 'text-blue-600'}`} />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Hora
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="input pr-10 appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0"
                  required
                  ref={el => (window.modalTimeInput = el)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 p-0 m-0 border-0 bg-transparent focus:outline-none"
                  onClick={() => window.modalTimeInput && window.modalTimeInput.showPicker ? window.modalTimeInput.showPicker() : window.modalTimeInput && window.modalTimeInput.focus()}
                  tabIndex={0}
                  aria-label="Selecionar hora"
                >
                  <Clock className={`h-5 w-5 ${theme === 'dark' ? 'text-white' : 'text-green-600'}`} />
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo de Consulta
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="input"
              required
            >
              <option value="">Selecione o tipo</option>
              <option value="Consulta">Consulta</option>
              <option value="Limpeza">Limpeza</option>
              <option value="Extração">Extração</option>
              <option value="Obturação">Obturação</option>
              <option value="Canal">Canal</option>
              <option value="Emergência">Emergência</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Observações
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input"
              rows="3"
              placeholder="Observações sobre a consulta... (opcional)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
                className={`input ${formData.status === 'Realizado' ? 'text-green-700 dark:text-green-300' : formData.status === 'Cancelado' ? 'text-red-700 dark:text-red-300' : 'text-yellow-700 dark:text-yellow-300'}`}
                required
              >
                <option value="Pendente" className="text-yellow-700 dark:text-yellow-300">Pendente</option>
                <option value="Realizado" className="text-green-700 dark:text-green-300">Realizado</option>
                <option value="Cancelado" className="text-red-700 dark:text-red-300">Cancelado</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingAppointment(null);
              }}
              className="btn btn-secondary px-4 py-2 text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary px-4 py-2 text-sm"
            >
              {editingAppointment ? 'Salvar' : 'Agendar'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Aviso */}
      <ModalAviso
        isOpen={avisoAberto}
        onClose={() => setAvisoAberto(false)}
        title="Agendamento Inválido"
        message={avisoMsg}
      />
    </div>
  );
};

export default Agendamentos;