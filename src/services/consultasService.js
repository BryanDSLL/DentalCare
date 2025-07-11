const API_URL = 'http://172.16.31.176:3001/api';

export const consultasService = {
  async getAgendamentos() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/agendamentos`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },
  async createAgendamento(agendamento) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/agendamentos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(agendamento),
    });
    if (!response.ok) throw new Error('Erro ao criar agendamento');
    return response.json();
  },
async updateAgendamento(id, agendamento) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/agendamentos/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(agendamento),
    });
    if (!response.ok) throw new Error('Erro ao atualizar agendamento');
    return response.json();
},

async deleteAgendamento(id) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/agendamentos/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) throw new Error('Erro ao deletar agendamento');
    return response.json();
}
};