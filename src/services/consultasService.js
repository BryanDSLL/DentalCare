const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const servicoConsultas = {
  async getAgendamentos(start, end, statusArray) {
    const token = localStorage.getItem('token');
    let url = `${API_URL}/agendamentos`;
    const params = [];
    if (start && end) {
      params.push(`start=${encodeURIComponent(start)}`);
      params.push(`end=${encodeURIComponent(end)}`);
    }
    // Sempre envia o filtro de status, mesmo se todos marcados
    if (statusArray && statusArray.length > 0) {
      params.push(`status=${encodeURIComponent(JSON.stringify(statusArray))}`);
    }
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    const response = await fetch(url, {
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