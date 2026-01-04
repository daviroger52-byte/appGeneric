import { SPRINTS } from '../data/constants';

export const generatePlanQuests = (templateId, answers) => {
  const quests = [];
  const now = Date.now();
  
  // Data base para cálculos
  const currentYear = new Date().getFullYear();
  
  // Utilitário para determinar o Sprint com base no mês (0-11)
  const getSprintId = (monthIndex) => {
    const normalizedMonth = monthIndex % 12;
    if (normalizedMonth < 3) return 'sprint1';
    if (normalizedMonth < 6) return 'sprint2';
    if (normalizedMonth < 9) return 'sprint3';
    return 'sprint4';
  };

  if (templateId === 'finance_savings') {
    const total = parseFloat(answers.targetValue);
    const startMonth = parseInt(answers.startMonth);
    const endMonth = parseInt(answers.endMonth);
    
    // CÁLCULO INTELIGENTE DA DURAÇÃO
    let duration = 0;
    if (endMonth >= startMonth) {
      // Ex: Jan(0) a Mar(2) = 3 meses (0, 1, 2)
      duration = endMonth - startMonth + 1;
    } else {
      // Ex: Nov(10) a Fev(1) do ano seguinte = 4 meses (10, 11, 0, 1)
      duration = (12 - startMonth) + endMonth + 1;
    }

    if (duration <= 0 || total <= 0) return [];

    const monthlyValue = Math.ceil(total / duration);

    // Loop baseado na duração calculada
    for (let i = 0; i < duration; i++) {
      const targetDate = new Date(currentYear, startMonth + i, 1);
      
      const monthName = targetDate.toLocaleDateString('pt-BR', { month: 'long' });
      const fullYear = targetDate.getFullYear();
      const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);
      
      const titleSuffix = fullYear > currentYear ? `/${fullYear}` : '';

      quests.push({
        title: `Aporte ${capitalizedMonth}${titleSuffix}`,
        category: 'finance',
        difficulty: 'hard', 
        sprint: getSprintId(targetDate.getMonth()),
        frequency: 'once',
        type: 'progressive',
        completed: false,
        subtasks: [],
        metric: 'money',
        progress: {
          current: 0,
          target: monthlyValue,
          unit: 'R$'
        },
        createdAt: now + i,
        isPriority: true,
        objectiveId: null // Será preenchido no App.jsx se implementarmos objetivos pai
      });
    }
  }

  else if (templateId === 'reading_goal') {
    const totalBooks = parseInt(answers.targetValue);
    const duration = parseInt(answers.duration) || 12;
    const mode = answers.frequency;

    if (mode === 'focused') {
      const booksPerMonth = totalBooks / duration; 
      
      for (let i = 0; i < totalBooks; i++) {
        const monthOffset = Math.floor(i / booksPerMonth);
        const targetDate = new Date(currentYear, (parseInt(answers.startMonth || 0)) + monthOffset, 1);
        
        const monthName = targetDate.toLocaleDateString('pt-BR', { month: 'long' });
        const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

        quests.push({
          title: `Leitura #${i + 1} (${capitalizedMonth})`,
          category: 'learning',
          difficulty: 'medium',
          sprint: getSprintId(targetDate.getMonth()),
          frequency: 'once',
          type: 'checklist',
          completed: false,
          subtasks: [],
          metric: 'pages',
          progress: null,
          createdAt: now + i,
          isPriority: false,
          objectiveId: null
        });
      }
    } else {
      for (let i = 1; i <= totalBooks; i++) {
        quests.push({
          title: `Ler Livro #${i}`,
          category: 'learning',
          difficulty: 'medium',
          sprint: 'ongoing',
          frequency: 'once',
          type: 'checklist',
          completed: false,
          subtasks: [],
          metric: 'custom',
          createdAt: now + i,
          isPriority: false,
          objectiveId: null
        });
      }
    }
  }

  return quests;
};