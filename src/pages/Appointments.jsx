import { useState, useEffect } from 'react';
import { consultasService } from '../services/consultasService';
import { pacientesService } from '../services/pacientesService';
import Modal from '../components/Modal';
import { Calendar, Clock, Plus, Edit, Trash2 } from 'lucide-react';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [loading, setLoading] = useState(false); // Não inicia mais como true
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    date: '',
    time: '',
    type: '',
    notes: '',
    phone: ''
  });

  useEffect(() => {
    const loadAppointmentsAsync = async () => {
      try {
        const date = new Date(selectedDate);
        const appointmentsData = await consultasService.getAppointments(date);
        setAppointments(appointmentsData);
      } catch (error) {
        console.error('Error loading appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAppointmentsAsync();
    loadPatients();
  }, [selectedDate]);

  const loadAppointments = async () => {
    try {
      const date = new Date(selectedDate);
      const appointmentsData = await consultasService.getAppointments(date);
      setAppointments(appointmentsData);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      const patientsData = await pacientesService.getPatients();
      setPatients(patientsData);
    } catch (error) {
      console.error('Error loading patients:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const appointmentData = {
        ...formData,
        date: new Date(`${formData.date}T${formData.time}:00`),
      };

      if (editingAppointment) {
        await consultasService.updateAppointment(editingAppointment.id, appointmentData);
      } else {
        await consultasService.createAppointment(appointmentData);
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
        phone: ''
      });
      loadAppointments();
    } catch (error) {
      console.error('Error saving appointment:', error);
    }
  };

  const handleEdit = (appointment) => {
    setEditingAppointment(appointment);
    const appointmentDate = appointment.date.toDate ? appointment.date.toDate() : new Date(appointment.date);
    setFormData({
      patientId: appointment.patientId || '',
      patientName: appointment.patientName || '',
      date: appointmentDate.toISOString().split('T')[0],
      time: appointmentDate.toTimeString().slice(0, 5),
      type: appointment.type || '',
      notes: appointment.notes || '',
      phone: appointment.phone || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja cancelar esta consulta?')) {
      try {
        await consultasService.deleteAppointment(id);
        loadAppointments();
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
      patientName: patient ? patient.name : '',
      phone: patient ? patient.phone : ''
    });
  };

  const formatDateTime = (date) => {
    const dateObj = date.toDate ? date.toDate() : new Date(date);
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Agendamentos</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary px-4 py-2 text-sm font-medium"
        >
          <Plus size={20} className="mr-2" />
          Nova Consulta
        </button>
      </div>

      {/* Date Filter */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <Calendar className="h-5 w-5 text-gray-400 dark:text-white min-w-[20px] min-h-[20px]" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input max-w-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors [&::-webkit-calendar-picker-indicator]:invert-0 dark:[&::-webkit-calendar-picker-indicator]:invert"
          />
        </div>
      </div>

      {/* Appointments List */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Consultas - {new Date(selectedDate).toLocaleDateString('pt-BR')}
        </h2>
        
        {appointments.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            Nenhuma consulta agendada para esta data
          </p>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => {
              const { time } = formatDateTime(appointment.date);
              return (
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
                        {time} - {appointment.type}
                      </p>
                      {appointment.notes && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {appointment.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(appointment)}
                      className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(appointment.id)}
                      className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                    >
                      <Trash2 size={16} />
                    </button>
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
            phone: ''
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
                  {patient.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Data
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Hora
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="input"
                required
              />
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
              placeholder="Observações sobre a consulta..."
            />
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
    </div>
  );
};

export default Appointments;