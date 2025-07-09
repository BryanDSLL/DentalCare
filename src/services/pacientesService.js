const API_URL = 'http://172.16.31.176:3001/api';

export const pacientesService = {
  async getPacientes() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/pacientes`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  async getPacienteById(id) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/pacientes/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
      throw new Error('Paciente não encontrado');
    }
    return response.json();
  },

  async createPaciente(paciente) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/pacientes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(paciente),
    });
    if (!response.ok) {
      throw new Error('Erro ao criar paciente');
    }
    return response.json();
  },

  async updatePaciente(id, paciente) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/pacientes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(paciente),
    });
    if (!response.ok) {
      throw new Error('Erro ao atualizar paciente');
    }
    return response.json();
  },

  async deletePaciente(id) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/pacientes/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
      throw new Error('Erro ao deletar paciente');
    }
    return response.json();
  }
};