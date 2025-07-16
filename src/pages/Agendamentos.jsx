import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { servicoConsultas } from '../services/consultasService.js';
import { servicoPacientes } from '../services/pacientesService.js';
import Modal from '../components/Modal';
import { Clock, Plus, Edit, Trash2 } from 'lucide-react';

const Agendamentos = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [pendingDate, setPendingDate] = useState(selectedDate);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [loading, setLoading] = useState(false); 
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    date: '',
    time: '',
    type: '',
    notes: ''
  });
  // const [formErrors, setFormErrors] = useState({});
  const { showSidebarButton } = useOutletContext();

  const loadAppointmentsAsync = async () => {
    setLoading(true);
    try {
      // Busca todos agendamentos do backend
      const appointmentsData = await servicoConsultas.getAgendamentos();
      setAppointments(appointmentsData);
      console.log('Agendamentos recebidos:', appointmentsData);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointmentsAsync();
    loadPatients();
  }, [selectedDate]);

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
    try {
      const appointmentData = {
        idpaciente: formData.patientId,
        data: `${formData.date}T${formData.time}:00`,
        tipo: formData.type,
        notas: formData.notes
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
        notes: ''
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
      notes: appointment.notas || ''
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

  const filteredAppointments = appointments.filter(appointment => {
    if (!appointment.data) return false;
    let localDate;
    if (typeof appointment.data === 'string') {
      localDate = parseDateLocal(appointment.data);
      if (isNaN(localDate.getTime())) return false;
    } else {
      localDate = new Date(appointment.data);
      if (isNaN(localDate.getTime())) return false;
    }
    const [selYear, selMonth, selDay] = selectedDate.split('-').map(Number);
    const match = (
      localDate.getFullYear() === selYear &&
      localDate.getMonth() + 1 === selMonth &&
      localDate.getDate() === selDay
    );
    if (match) {
      console.log('Match:', {
        data: appointment.data,
        localDate: localDate.toISOString(),
        selectedDate
      });
    }
    return match;
  });

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
        <h1 className={`text-2xl font-bold text-gray-900 dark:text-white ${showSidebarButton ? 'ml-14' : ''} lg:ml-0`}>Agendamentos</h1>
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
          <input
            type="date"
            value={pendingDate}
            onChange={(e) => setPendingDate(e.target.value)}
            className="input w-40 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors [&::-webkit-calendar-picker-indicator]:invert-0 dark:[&::-webkit-calendar-picker-indicator]:invert"
          />
          <button
            type="button"
            className="btn btn-primary px-4 py-2 text-sm ml-2"
            onClick={() => {
              // Garante formato yyyy-MM-dd
              const normalized = new Date(pendingDate).toISOString().split('T')[0];
              setSelectedDate(normalized);
            }}
          >
            OK
          </button>
        </div>
      </div>

      {/* Appointments List */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Consultas - {selectedDate.split('-').reverse().join('/')}
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
                        {time} - {appointment.tipo}
                      </p>
                      {appointment.notas && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {appointment.notas}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
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
            notes: ''
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
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="input"
                required
              />
              {/* {formErrors.date && (
                <div className="text-red-600 text-xs mt-1">{formErrors.date}</div>
              )} */}
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
              placeholder="Observações sobre a consulta... (opcional)"
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

export default Agendamentos;