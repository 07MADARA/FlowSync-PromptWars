export const ZONES = [
  { id: "Gates", name: "Entry Gates", x: 50, y: 85, type: "entry" },
  { id: "Concourse_A", name: "Concourse A", x: 20, y: 50, type: "concourse" },
  { id: "Concourse_B", name: "Concourse B", x: 80, y: 50, type: "concourse" },
  { id: "Food_Court", name: "Food Court", x: 50, y: 15, type: "amenity" },
  { id: "Seating", name: "Main Seating", x: 50, y: 50, type: "seating", r: 25 },
];

export const EDGES = [
  { from: "Gates", to: "Concourse_A" },
  { from: "Gates", to: "Concourse_B" },
  { from: "Concourse_A", to: "Food_Court" },
  { from: "Concourse_B", to: "Food_Court" },
  { from: "Concourse_A", to: "Seating" },
  { from: "Concourse_B", to: "Seating" },
  { from: "Food_Court", to: "Seating" },
];
