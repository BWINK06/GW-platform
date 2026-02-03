export interface Client {
  id: string;
  name: string;
  industry: string;
  monthlyBudget: string;
  goals: string[];
  website: string;
  status: "active" | "prospect" | "onboarding";
  healthScore: number;
  contacts: { name: string; role: string }[];
}

// Sample clients for the prototype — replace with real data / database later
export const clients: Client[] = [
  {
    id: "ranch-house",
    name: "Ranch House Designs",
    industry: "Agriculture / Western Lifestyle",
    monthlyBudget: "$8,000",
    goals: [
      "Increase website traffic by 40%",
      "Generate qualified leads for web design services",
      "Build brand awareness in agricultural sector",
    ],
    website: "ranchhousedesigns.com",
    status: "active",
    healthScore: 82,
    contacts: [
      { name: "Sarah Mitchell", role: "Owner" },
      { name: "Jason Torres", role: "Marketing Director" },
    ],
  },
  {
    id: "lone-star-dental",
    name: "Lone Star Dental Group",
    industry: "Healthcare / Dental",
    monthlyBudget: "$12,000",
    goals: [
      "Increase new patient appointments by 25%",
      "Dominate local SEO in 3 metro areas",
      "Reduce cost per acquisition below $75",
    ],
    website: "lonestardental.com",
    status: "active",
    healthScore: 91,
    contacts: [
      { name: "Dr. Mark Reynolds", role: "Practice Owner" },
      { name: "Lisa Chen", role: "Office Manager" },
    ],
  },
  {
    id: "west-texas-energy",
    name: "West Texas Energy Solutions",
    industry: "Energy / Oil & Gas Services",
    monthlyBudget: "$20,000",
    goals: [
      "Establish thought leadership in renewable energy transition",
      "Generate B2B leads from mid-market companies",
      "Launch new service line awareness campaign",
    ],
    website: "westtexasenergy.com",
    status: "active",
    healthScore: 74,
    contacts: [
      { name: "Robert Dawson", role: "VP Marketing" },
      { name: "Angela Ruiz", role: "Business Development" },
    ],
  },
  {
    id: "mesa-hospitality",
    name: "Mesa Hospitality Group",
    industry: "Hospitality / Hotels & Restaurants",
    monthlyBudget: "$15,000",
    goals: [
      "Drive direct bookings (reduce OTA dependency)",
      "Launch loyalty program awareness",
      "Increase restaurant foot traffic in off-peak hours",
    ],
    website: "mesahospitality.com",
    status: "onboarding",
    healthScore: 65,
    contacts: [
      { name: "Patricia Vega", role: "Director of Marketing" },
      { name: "Tom Nakamura", role: "GM" },
    ],
  },
  {
    id: "frontier-auto",
    name: "Frontier Auto Group",
    industry: "Automotive / Dealerships",
    monthlyBudget: "$25,000",
    goals: [
      "Sell 15% more units per month",
      "Increase service department revenue",
      "Win conquest customers from competing dealers",
    ],
    website: "frontierautogroup.com",
    status: "active",
    healthScore: 88,
    contacts: [
      { name: "Mike Sullivan", role: "Dealer Principal" },
      { name: "Karen Wright", role: "Marketing Manager" },
    ],
  },
];

export function getClient(id: string): Client | undefined {
  return clients.find((c) => c.id === id);
}
