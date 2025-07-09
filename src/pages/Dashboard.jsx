import { useState, useEffect } from 'react';
import { consultasService } from '../services/consultasService';
import { Calendar, Clock, User, Phone } from 'lucide-react';

const Dashboard = () => {
  const [todaysAppointments, setTodaysAppointments] = useState([]);
  const [stats, setStats] = useState({
    today: 0,
    upcoming: 0,
    total: 0
  });
  const [loading, setLoading] = useState(false); // Não inicia mais como true

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const today = new Date();
      const appointments = await consultasService.getAppointments(today);
      setTodaysAppointments(appointments);
      
      // Calculate stats
      const allAppointments = await consultasService.getAppointments();
      const upcoming = allAppointments.filter(apt => 
        apt.date.toDate ? apt.date.toDate() > today : new Date(apt.date) > today
      ).length;
      
      setStats({
        today: appointments.length,
        upcoming,
        total: allAppointments.length
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };


  const formatTime = (date) => {
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
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
                Próximas Consultas
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
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Consultas de Hoje
        </h2>
        
        {todaysAppointments.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            Nenhuma consulta agendada para hoje
          </p>
        ) : (
          <div className="space-y-4">
            {todaysAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-primary-100 dark:bg-primary-900 p-2 rounded-lg">
                    <Clock className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {appointment.patientName}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatTime(appointment.date)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {appointment.type}
                  </p>
                  {appointment.phone && (
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Phone className="h-4 w-4 mr-1" />
                      {appointment.phone}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;