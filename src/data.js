export const data = {
  semesters: [
    {
      id: "sem1",
      label: "Semester 1",
      emoji: "①",
      branches: [
        {
          id: 1, // 🔥 must match DB branch_id
          label: "CSE",
          subjects: [
            {
              id: 101, // 🔥 subject_id
              label: "OOP",
              emoji: "💻",
              modules: [
                { id: 1001, name: "What is OOP" },
                { id: 1002, name: "Polymorphism" },
                { id: 1003, name: "Inheritance" },
                { id: 1004, name: "Abstraction" },
                { id: 1005, name: "Advanced file handling" }
              ]
            },
            {
              id: 102,
              label: "Physics",
              emoji: "⚡",
              modules: [
                { id: 1101, name: "Mechanics" },
                { id: 1102, name: "Energy" },
                { id: 1103, name: "Waves" },
                { id: 1104, name: "Optics" },
                { id: 1105, name: "Modern Physics" }
              ]
            },
            {
              id: 103,
              label: "Chemistry",
              emoji: "⚗️",
              modules: [
                { id: 1201, name: "Atoms" },
                { id: 1202, name: "Bonding" },
                { id: 1203, name: "Reactions" },
                { id: 1204, name: "Organic" },
                { id: 1205, name: "Equilibrium" }
              ]
            },
            {
              id: 104,
              label: "Maths",
              emoji: "📐",
              modules: [
                { id: 1301, name: "Calculus" },
                { id: 1302, name: "Algebra" },
                { id: 1303, name: "Matrices" },
                { id: 1304, name: "Probability" },
                { id: 1305, name: "Geometry" }
              ]
            }
          ]
        },

        {
          id: 2,
          label: "ECE",
          subjects: [
            {
              id: 201,
              label: "Electronics",
              emoji: "🔌",
              modules: [
                { id: 2001, name: "Circuits" },
                { id: 2002, name: "Diodes" },
                { id: 2003, name: "Transistors" },
                { id: 2004, name: "Amplifiers" }
              ]
            }
          ]
        }
      ]
    },

    {
      id: "sem2",
      label: "Semester 2",
      emoji: "②",
      branches: []
    },
    {
      id: "sem3",
      label: "Semester 3",
      emoji: "③",
      branches: []
    },
    {
      id: "sem4",
      label: "Semester 4",
      emoji: "④",
      branches: []
    }
  ]
};