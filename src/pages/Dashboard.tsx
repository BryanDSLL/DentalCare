import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAppointments } from '../hooks/useAppointments';
import { usePatients } from '../hooks/usePatients';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const Dashboard: React.FC = () => {
  const { appointments, loading: appointmentsLoading } = useAppointments();
  const { patients, loading: patientsLoading } = usePatients();

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(apt => apt.date === today);
    
    return {
      totalPatients: patients.length,
      totalAppointments: appointments.length,
      todayAppointments: todayAppointments.length,
      scheduledAppointments: appointments.filter(apt => apt.status === 'scheduled').length,
      completedAppointments: appointments.filter(apt => apt.status === 'completed').length,
      cancelledAppointments: appointments.filter(apt => apt.status === 'cancelled').length,
    };
  }, [appointments, patients]);

  const upcomingAppointments = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return appointments
      .filter(apt => apt.date >= today && apt.status === 'scheduled')
      .slice(0, 5);
  }, [appointments]);

  if (appointmentsLoading || patientsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {new Date().toLocaleDateString('pt-BR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Pacientes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalPatients}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Consultas Hoje</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.todayAppointments}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Agendadas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.scheduledAppointments}</p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
              <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Concluídas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completedAppointments}</p>
            </div>
            <div className="p-3 bg-teal-100 dark:bg-teal-900 rounded-full">
              <CheckCircle className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Próximas Consultas</h2>
            <Link 
              to="/appointments" 
              className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium"
            >
              Ver todas
            </Link>
          </div>
        </div>
        <div className="p-6">
          {upcomingAppointments.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              Nenhuma consulta agendada
            </p>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{appointment.patientName}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(appointment.date).toLocaleDateString('pt-BR')} às {appointment.time}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      appointment.status === 'scheduled' 
                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                        : appointment.status === 'completed'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {appointment.status === 'scheduled' ? 'Agendada' : 
                       appointment.status === 'completed' ? 'Concluída' : 'Cancelada'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link 
          to="/appointments" 
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg p-6 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Novo Agendamento</h3>
              <p className="text-blue-100 mt-1">Agendar nova consulta</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-200" />
          </div>
        </Link>

        <Link 
          to="/patients" 
          className="bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-lg p-6 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Cadastrar Paciente</h3>
              <p className="text-teal-100 mt-1">Adicionar novo paciente</p>
            </div>
            <Users className="w-8 h-8 text-teal-200" />
          </div>
        </Link>
      </div>
    </div>
  );
};