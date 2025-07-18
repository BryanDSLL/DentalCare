import { useState, useEffect } from 'react';
import { servicoConsultas } from '../services/consultasService.js';
import { servicoPacientes } from '../services/pacientesService.js';
import { Calendar, Clock, User } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

const Dashboard = () => {
  const { showSidebarButton } = useOutletContext();
  const [todaysAppointments, setTodaysAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState({
    today: 0,
    upcoming: 0,
    total: 0
  });
  const [loading, setLoading] = useState(false);
  const [statusMenuOpenId, setStatusMenuOpenId] = useState(null);

  useEffect(() => {
    loadDashboardData();
    loadPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const defaultStatusArray = ['Pendente', 'Realizado', 'Cancelado'];

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const today = new Date();
      today.setHours(0,0,0,0);
      // Sempre envia todos status
      const allAppointments = await servicoConsultas.getAgendamentos(undefined, undefined, defaultStatusArray);
      if (!Array.isArray(allAppointments)) {
        setTodaysAppointments([]);
        setStats({ today: 0, upcoming: 0, total: 0 });
        console.error('Erro ao carregar agendamentos:', allAppointments.error || allAppointments);
        return;
      }
      // Consultas de hoje
      const todays = allAppointments.filter(apt => {
        const aptDate = new Date(apt.data);
        return aptDate.getFullYear() === today.getFullYear() &&
          aptDate.getMonth() === today.getMonth() &&
          aptDate.getDate() === today.getDate();
      });
      setTodaysAppointments(todays);
      // Próximas consultas (após hoje, apenas Pendente)
      const upcoming = allAppointments.filter(apt => {
        const aptDate = new Date(apt.data);
        return aptDate > today && apt.status === 'Pendente';
      }).length;
      setStats({
        today: todays.length,
        upcoming,
        total: allAppointments.length
      });
    } catch (error) {
      setTodaysAppointments([]);
      setStats({ today: 0, upcoming: 0, total: 0 });
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      const patientsData = await servicoPacientes.buscarPacientes();
      setPatients(patientsData);
    } catch (error) {
      setPatients([]);
      console.error('Error loading patients:', error);
    }
  };

  const formatDateTime = (date) => {
    const dateObj = new Date(date);
    return {
      date: dateObj.toLocaleDateString('pt-BR'),
      time: dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-500 dark:text-gray-400">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-2xl font-bold text-gray-900 dark:text-white ${showSidebarButton ? 'ml-14' : ''} lg:ml-0`}>
          Dashboard
        </h1>
        <p className="mt-5 text-gray-600 dark:text-gray-400">
          Bem-vindo ao sistema de agendamento
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-gray-800 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600 dark:text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-white">
                Consultas Hoje
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.today}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <Clock className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Consultas Pendentes
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.upcoming}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <User className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total de Consultas
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.total}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Appointments */}
      <div className="card overflow-visible">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Consultas de Hoje
        </h2>
        {todaysAppointments.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            Nenhuma consulta para hoje
          </p>
        ) : (
          <div className="space-y-4">
            {todaysAppointments.map((appointment) => {
              const patient = patients.find(p => p.id === appointment.idpaciente);
              const { date, time } = formatDateTime(appointment.data);
              return (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-primary-100 dark:bg-primary-900 p-2 rounded-lg">
                      <Clock className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {patient ? patient.nome : 'Paciente'}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {date} - {time} {appointment.tipo ? `- ${appointment.tipo}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <button
                        id={`status-btn-${appointment.id}`}
                        type="button"
                        className={`px-2 py-1 text-xs rounded font-semibold focus:outline-none transition-all shadow-sm border border-gray-200 dark:border-gray-700
                          ${appointment.status === 'Realizado' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : appointment.status === 'Cancelado' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'}`}
                        onClick={() => setStatusMenuOpenId(statusMenuOpenId === appointment.id ? null : appointment.id)}
                        aria-label="Alterar status"
                      >
                        {appointment.status || 'Pendente'}
                      </button>
                      {statusMenuOpenId === appointment.id && (
                        <div
                          className={`absolute left-0 z-20 bg-white dark:bg-gray-800 rounded shadow-lg border border-gray-200 dark:border-gray-700 w-32 ${window.innerHeight - (document.getElementById(`status-btn-${appointment.id}`)?.getBoundingClientRect().bottom ?? 0) < 180 ? 'bottom-0 mb-2' : 'mt-2'}`}
                          style={{
                            // fallback for SSR or if element not found
                            top: window.innerHeight - (document.getElementById(`status-btn-${appointment.id}`)?.getBoundingClientRect().bottom ?? 0) < 180 ? 'auto' : '0.5rem',
                            bottom: window.innerHeight - (document.getElementById(`status-btn-${appointment.id}`)?.getBoundingClientRect().bottom ?? 0) < 180 ? '2.5rem' : 'auto'
                          }}
                        >
                          {[{ value: 'Pendente', label: 'Pendente', color: 'text-yellow-700 dark:text-yellow-300' }, { value: 'Realizado', label: 'Realizado', color: 'text-green-700 dark:text-green-300' }, { value: 'Cancelado', label: 'Cancelado', color: 'text-red-700 dark:text-red-300' }].map(option => (
                            <button
                              key={option.value}
                              className={`block w-full text-left px-3 py-2 text-xs font-semibold bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 ${option.color} hover:opacity-80 focus:outline-none ${appointment.status === option.value ? 'ring-2 ring-primary-500' : ''}`}
                              onClick={async () => {
                                await servicoConsultas.updateAgendamento(appointment.id, { ...appointment, status: option.value });
                                setStatusMenuOpenId(null);
                                loadDashboardData();
                              }}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;