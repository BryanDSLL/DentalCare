const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const servicoPacientes = {
  async buscarPacientes() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/pacientes`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  async buscarPacientePorId(id) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/pacientes/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
      throw new Error('Paciente não encontrado');
    }
    return response.json();
  },

  async criarPaciente(paciente) {
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

  async atualizarPaciente(id, paciente) {
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

  async excluirPaciente(id) {
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