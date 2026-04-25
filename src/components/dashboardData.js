export const comparisonData = {
  summary: {
    continue: 3,
    new: 2,
    action: 1,
  },
  categories: ['Education', 'Workers / Labor', 'Healthcare', 'Food & Ration', 'Housing', 'Financial Support'],
  rows: [
    {
      category: 'Education',
      current: {
        name: 'Post-Matric Scholarship',
        tag: 'Education',
        status: 'Available',
        statusColor: '#10B981',
        desc: 'Financial assistance for students pursuing higher education.',
      },
      migrated: {
        name: 'Post-Matric Scholarship',
        tag: 'Education',
        status: 'Available',
        statusColor: '#10B981',
        desc: 'Financial assistance for students pursuing higher education.',
      }
    },
    {
      category: 'Workers / Labor',
      current: {
        name: 'Labor Welfare Fund',
        tag: 'Labor',
        status: 'Available',
        statusColor: '#10B981',
        desc: 'Social security benefits for industrial workers.',
      },
      migrated: {
        name: 'Migrant Support Scheme',
        tag: 'Labor',
        status: 'New',
        statusColor: '#3B82F6',
        desc: 'Special grants for incoming migrant laborers.',
        isNew: true
      }
    },
    {
      category: 'Food & Ration',
      current: {
        name: 'Antyodaya Anna Yojana',
        tag: 'Food',
        status: 'Available',
        statusColor: '#10B981',
        desc: 'Highly subsidized food grains for poorest families.',
      },
      migrated: {
        name: 'Antyodaya Anna Yojana',
        tag: 'Food',
        status: 'Needs Action',
        statusColor: '#F59E0B',
        desc: 'Requires Ration Card portability update at local office.',
        needsAction: true
      }
    },
    {
      category: 'Healthcare',
      current: {
        name: 'State Health Insurance',
        tag: 'Health',
        status: 'Available',
        statusColor: '#10B981',
        desc: 'Free treatment in empanelled state hospitals.',
      },
      migrated: {
        name: 'State Health Insurance',
        tag: 'Health',
        status: 'Not Available',
        statusColor: '#EF4444',
        desc: 'Benefit limited to home state residents only.',
        isFaded: true
      }
    },
    {
      category: 'Financial Support',
      current: null,
      migrated: {
        name: 'Kanya Sumangala Yojana',
        tag: 'Financial',
        status: 'New',
        statusColor: '#3B82F6',
        desc: 'Conditional cash transfer for girl child empowerment.',
        isNew: true
      }
    }
  ]
};
