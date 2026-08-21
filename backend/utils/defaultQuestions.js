const defaultQuestions = [
  // Mathematics (10)
  {
    questionText: "What is the result of 150 + 270?",
    section: "Mathematics",
    options: ["320", "420", "520", "380"],
    correctOptionIndex: 1
  },
  {
    questionText: "Solve: 500 - 185",
    section: "Mathematics",
    options: ["315", "325", "295", "415"],
    correctOptionIndex: 0
  },
  {
    questionText: "What is 12 multiplied by 8?",
    section: "Mathematics",
    options: ["86", "96", "106", "76"],
    correctOptionIndex: 1
  },
  {
    questionText: "Divide: 144 / 12",
    section: "Mathematics",
    options: ["10", "11", "12", "14"],
    correctOptionIndex: 2
  },
  {
    questionText: "Identify the increasing order (ascending order) of numbers: 45, 12, 89, 34",
    section: "Mathematics",
    options: [
      "12 < 34 < 45 < 89",
      "89 < 45 < 34 < 12",
      "12 < 45 < 34 < 89",
      "34 < 12 < 45 < 89"
    ],
    correctOptionIndex: 0
  },
  {
    questionText: "Identify the decreasing order (descending order) of numbers: 100, 250, 50, 150",
    section: "Mathematics",
    options: [
      "50 > 100 > 150 > 250",
      "250 > 150 > 100 > 50",
      "250 > 100 > 150 > 50",
      "150 > 250 > 100 > 50"
    ],
    correctOptionIndex: 1
  },
  {
    questionText: "If a pen costs ₹15, what is the cost of 6 pens?",
    section: "Mathematics",
    options: ["₹75", "₹80", "₹90", "₹100"],
    correctOptionIndex: 2
  },
  {
    questionText: "What is the next number in the pattern: 2, 4, 8, 16, _?",
    section: "Mathematics",
    options: ["20", "24", "32", "30"],
    correctOptionIndex: 2
  },
  {
    questionText: "Add: 12.5 + 7.25",
    section: "Mathematics",
    options: ["19.75", "19.50", "20.25", "19.25"],
    correctOptionIndex: 0
  },
  {
    questionText: "What is the perimeter of a square with side length 5 cm?",
    section: "Mathematics",
    options: ["15 cm", "20 cm", "25 cm", "10 cm"],
    correctOptionIndex: 1
  },

  // Science (10)
  {
    questionText: "Lion (शेर) kis tarah ka janvar hai?",
    section: "Science",
    options: [
      "Shakahari (Herbivore)",
      "Mansahari (Carnivore)",
      "Sarbahari (Omnivore)",
      "Decomposer"
    ],
    correctOptionIndex: 1
  },
  {
    questionText: "Insan (Human) kis category me aata hai?",
    section: "Science",
    options: [
      "Shakahari (Herbivore)",
      "Mansahari (Carnivore)",
      "Sarbahari (Omnivore)",
      "None of these"
    ],
    correctOptionIndex: 2
  },
  {
    questionText: "Cow (गाय) kis tarah ka janvar hai?",
    section: "Science",
    options: [
      "Shakahari (Herbivore)",
      "Mansahari (Carnivore)",
      "Sarbahari (Omnivore)",
      "Parasite"
    ],
    correctOptionIndex: 0
  },
  {
    questionText: "Plants apna khana banane ke liye kaun si gas absorb karte hain?",
    section: "Science",
    options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
    correctOptionIndex: 1
  },
  {
    questionText: "Human body me kitni bones (हड्डियां) hoti hain?",
    section: "Science",
    options: ["206", "306", "106", "250"],
    correctOptionIndex: 0
  },
  {
    questionText: "Hamare Solar System ka sabse bada planet kaun sa hai?",
    section: "Science",
    options: ["Earth", "Mars", "Jupiter", "Saturn"],
    correctOptionIndex: 2
  },
  {
    questionText: "Pani (Water) ka chemical formula kya hai?",
    section: "Science",
    options: ["CO2", "H2O", "O2", "NaCl"],
    correctOptionIndex: 1
  },
  {
    questionText: "Hamare Earth par primary source of energy kya hai?",
    section: "Science",
    options: ["Moon", "Sun", "Coal", "Wind"],
    correctOptionIndex: 1
  },
  {
    questionText: "Kaun sa organ hamari body me blood pump karta hai?",
    section: "Science",
    options: ["Lungs", "Brain", "Heart", "Kidney"],
    correctOptionIndex: 2
  },
  {
    questionText: "Plants ka green color kis pigment ki wajah se hota hai?",
    section: "Science",
    options: ["Chlorophyll", "Hemoglobin", "Melanin", "Carotene"],
    correctOptionIndex: 0
  },

  // Social Science (10)
  {
    questionText: "Bihar ki rajdhani kya hai?",
    section: "Social Science",
    options: ["Patna", "Gaya", "Muzaffarpur", "Darbhanga"],
    correctOptionIndex: 0
  },
  {
    questionText: "India ki rajdhani (Capital) kya hai?",
    section: "Social Science",
    options: ["Mumbai", "New Delhi", "Kolkata", "Chennai"],
    correctOptionIndex: 1
  },
  {
    questionText: "India kab aazad (Independent) hua tha?",
    section: "Social Science",
    options: ["15 August 1947", "26 January 1950", "15 August 1950", "2 October 1947"],
    correctOptionIndex: 0
  },
  {
    questionText: "Republic Day (गणतंत्र दिवस) kab manaya jata hai?",
    section: "Social Science",
    options: ["15 August", "26 January", "2 October", "14 November"],
    correctOptionIndex: 1
  },
  {
    questionText: "Taj Mahal kis shahar me sthit hai?",
    section: "Social Science",
    options: ["Delhi", "Agra", "Jaipur", "Lucknow"],
    correctOptionIndex: 1
  },
  {
    questionText: "India ke first Prime Minister kaun the?",
    section: "Social Science",
    options: ["Mahatma Gandhi", "Jawaharlal Nehru", "Dr. Rajendra Prasad", "Subhas Chandra Bose"],
    correctOptionIndex: 1
  },
  {
    questionText: "India ka national bird (राष्ट्रीय पक्षी) kaun sa hai?",
    section: "Social Science",
    options: [
      "Peacock (मोर)",
      "Parrot (तोता)",
      "Crow (कौआ)",
      "Pigeon (कबूतर)"
    ],
    correctOptionIndex: 0
  },
  {
    questionText: "Red Fort (लाल किला) kisne banwaya tha?",
    section: "Social Science",
    options: ["Akbar", "Shah Jahan", "Babur", "Humayun"],
    correctOptionIndex: 1
  },
  {
    questionText: "Kaun se leader ko 'Bapu' ke naam se jana jata hai?",
    section: "Social Science",
    options: ["Jawaharlal Nehru", "Mahatma Gandhi", "Bhagat Singh", "Sardar Patel"],
    correctOptionIndex: 1
  },
  {
    questionText: "National Anthem 'Jana Gana Mana' kisne likha tha?",
    section: "Social Science",
    options: [
      "Rabindranath Tagore",
      "Bankim Chandra Chatterjee",
      "Mahatma Gandhi",
      "Sarojini Naidu"
    ],
    correctOptionIndex: 0
  }
];

module.exports = defaultQuestions;
