// Sistema de autenticação demo que simula o Firebase
export interface DemoUser {
  uid: string;
  email: string;
  emailVerified: boolean;
  metadata: {
    creationTime: string;
    lastSignInTime: string;
  };
}

// Usuários demo pré-cadastrados
const DEMO_USERS = [
  {
    email: 'admin@dentalcare.com',
    password: '123456',
    uid: 'demo-admin-123',
    emailVerified: true,
    metadata: {
      creationTime: '2024-01-01T10:00:00Z',
      lastSignInTime: new Date().toISOString()
    }
  },
  {
    email: 'dentista@clinica.com',
    password: 'dentista123',
    uid: 'demo-dentista-456',
    emailVerified: true,
    metadata: {
      creationTime: '2024-01-15T14:30:00Z',
      lastSignInTime: new Date().toISOString()
    }
  }
];

// Simula o localStorage como banco de dados
const STORAGE_KEYS = {
  CURRENT_USER: 'demo_current_user',
  USERS: 'demo_users',
  PATIENTS: 'demo_patients',
  APPOINTMENTS: 'demo_appointments'
};

// Inicializa dados demo se não existirem
const initializeDemoData = () => {
  // Inicializar usuários
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEMO_USERS));
  }

  // Inicializar pacientes demo
  if (!localStorage.getItem(STORAGE_KEYS.PATIENTS)) {
    const demoPatients = [
      {
        id: 'patient-1',
        name: 'Maria Silva Santos',
        email: 'maria.silva@email.com',
        phone: '(11) 99999-1234',
        dateOfBirth: '1985-03-15',
        address: 'Rua das Flores, 123 - São Paulo, SP',
        createdAt: '2024-01-10T10:00:00Z',
        updatedAt: '2024-01-10T10:00:00Z'
      },
      {
        id: 'patient-2',
        name: 'João Carlos Oliveira',
        email: 'joao.carlos@email.com',
        phone: '(11) 98888-5678',
        dateOfBirth: '1978-07-22',
        address: 'Av. Paulista, 456 - São Paulo, SP',
        createdAt: '2024-01-12T14:30:00Z',
        updatedAt: '2024-01-12T14:30:00Z'
      },
      {
        id: 'patient-3',
        name: 'Ana Paula Costa',
        email: 'ana.paula@email.com',
        phone: '(11) 97777-9012',
        dateOfBirth: '1992-11-08',
        address: 'Rua Augusta, 789 - São Paulo, SP',
        createdAt: '2024-01-15T09:15:00Z',
        updatedAt: '2024-01-15T09:15:00Z'
      }
    ];
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(demoPatients));
  }

  // Inicializar agendamentos demo
  if (!localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const demoAppointments = [
      {
        id: 'appointment-1',
        patientId: 'patient-1',
        patientName: 'Maria Silva Santos',
        date: today.toISOString().split('T')[0],
        time: '09:00',
        duration: 60,
        notes: 'Consulta de rotina - limpeza',
        status: 'scheduled',
        createdAt: '2024-01-10T10:00:00Z',
        updatedAt: '2024-01-10T10:00:00Z'
      },
      {
        id: 'appointment-2',
        patientId: 'patient-2',
        patientName: 'João Carlos Oliveira',
        date: today.toISOString().split('T')[0],
        time: '14:30',
        duration: 90,
        notes: 'Tratamento de canal - segunda sessão',
        status: 'scheduled',
        createdAt: '2024-01-12T14:30:00Z',
        updatedAt: '2024-01-12T14:30:00Z'
      },
      {
        id: 'appointment-3',
        patientId: 'patient-3',
        patientName: 'Ana Paula Costa',
        date: tomorrow.toISOString().split('T')[0],
        time: '10:00',
        duration: 60,
        notes: 'Avaliação para aparelho ortodôntico',
        status: 'scheduled',
        createdAt: '2024-01-15T09:15:00Z',
        updatedAt: '2024-01-15T09:15:00Z'
      },
      {
        id: 'appointment-4',
        patientId: 'patient-1',
        patientName: 'Maria Silva Santos',
        date: nextWeek.toISOString().split('T')[0],
        time: '15:00',
        duration: 60,
        notes: 'Retorno - verificação',
        status: 'scheduled',
        createdAt: '2024-01-10T10:00:00Z',
        updatedAt: '2024-01-10T10:00:00Z'
      }
    ];
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(demoAppointments));
  }
};

// Simula autenticação
export const demoAuth = {
  signInWithEmailAndPassword: async (email: string, password: string): Promise<DemoUser> => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simula delay da rede
    
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const user = users.find((u: any) => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error('auth/user-not-found');
    }

    const demoUser: DemoUser = {
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified,
      metadata: {
        ...user.metadata,
        lastSignInTime: new Date().toISOString()
      }
    };

    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(demoUser));
    return demoUser;
  },

  createUserWithEmailAndPassword: async (email: string, password: string): Promise<DemoUser> => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simula delay da rede
    
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const existingUser = users.find((u: any) => u.email === email);
    
    if (existingUser) {
      throw new Error('auth/email-already-in-use');
    }

    const newUser = {
      email,
      password,
      uid: `demo-user-${Date.now()}`,
      emailVerified: false,
      metadata: {
        creationTime: new Date().toISOString(),
        lastSignInTime: new Date().toISOString()
      }
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    const demoUser: DemoUser = {
      uid: newUser.uid,
      email: newUser.email,
      emailVerified: newUser.emailVerified,
      metadata: newUser.metadata
    };

    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(demoUser));
    return demoUser;
  },

  signOut: async (): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simula delay da rede
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  getCurrentUser: (): DemoUser | null => {
    const userStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return userStr ? JSON.parse(userStr) : null;
  },

  onAuthStateChanged: (callback: (user: DemoUser | null) => void) => {
    // Simula o listener do Firebase
    const checkAuth = () => {
      const user = demoAuth.getCurrentUser();
      callback(user);
    };

    // Checa imediatamente
    checkAuth();

    // Simula mudanças de estado (para desenvolvimento)
    const interval = setInterval(checkAuth, 1000);
    
    // Retorna função de cleanup
    return () => clearInterval(interval);
  }
};

// Simula Firestore
export const demoFirestore = {
  collection: (collectionName: string) => ({
    addDoc: async (data: any) => {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simula delay da rede
      
      const storageKey = collectionName === 'patients' ? STORAGE_KEYS.PATIENTS : STORAGE_KEYS.APPOINTMENTS;
      const items = JSON.parse(localStorage.getItem(storageKey) || '[]');
      
      const newItem = {
        id: `${collectionName}-${Date.now()}`,
        ...data
      };
      
      items.push(newItem);
      localStorage.setItem(storageKey, JSON.stringify(items));
      
      return { id: newItem.id };
    },

    getDocs: async () => {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simula delay da rede
      
      const storageKey = collectionName === 'patients' ? STORAGE_KEYS.PATIENTS : STORAGE_KEYS.APPOINTMENTS;
      const items = JSON.parse(localStorage.getItem(storageKey) || '[]');
      
      return {
        docs: items.map((item: any) => ({
          id: item.id,
          data: () => item
        }))
      };
    }
  }),

  doc: (collectionName: string, docId: string) => ({
    updateDoc: async (data: any) => {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simula delay da rede
      
      const storageKey = collectionName === 'patients' ? STORAGE_KEYS.PATIENTS : STORAGE_KEYS.APPOINTMENTS;
      const items = JSON.parse(localStorage.getItem(storageKey) || '[]');
      
      const index = items.findIndex((item: any) => item.id === docId);
      if (index !== -1) {
        items[index] = { ...items[index], ...data };
        localStorage.setItem(storageKey, JSON.stringify(items));
      }
    },

    deleteDoc: async () => {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simula delay da rede
      
      const storageKey = collectionName === 'patients' ? STORAGE_KEYS.PATIENTS : STORAGE_KEYS.APPOINTMENTS;
      const items = JSON.parse(localStorage.getItem(storageKey) || '[]');
      
      const filteredItems = items.filter((item: any) => item.id !== docId);
      localStorage.setItem(storageKey, JSON.stringify(filteredItems));
    }
  })
};

// Inicializa dados demo quando o módulo é carregado
initializeDemoData();