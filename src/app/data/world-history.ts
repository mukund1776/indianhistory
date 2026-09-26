export interface WorldHistoryEvent {
  date: string;
  title: string;
  summary: string;
}

// A selective global timeline. Keep the events in display order when editing.
export const worldHistoryEvents: WorldHistoryEvent[] = [
  {
    date: 'c. 10,000–4000 BCE',
    title: 'The beginnings of agriculture',
    summary: 'Farming developed independently in several regions, supporting larger settlements and new ways of life.',
  },
  {
    date: 'c. 3500–3000 BCE',
    title: 'The first cities and writing systems',
    summary: 'Urban societies and early writing in Mesopotamia and Egypt changed trade, government, and record-keeping.',
  },
  {
    date: 'c. 550 BCE–500 CE',
    title: 'Classical empires and ideas',
    summary: 'Large states and influential traditions took shape across the Mediterranean, West Asia, India, and China.',
  },
  {
    date: 'From the 2nd century BCE',
    title: 'Silk Roads connect Eurasia',
    summary: 'Overland and maritime networks carried goods, beliefs, technologies, and people across continents.',
  },
  {
    date: '7th–8th centuries CE',
    title: 'The rise and spread of Islam',
    summary: 'Islam emerged in Arabia and spread through expanding states and trade networks across Afro-Eurasia.',
  },
  {
    date: '1206–14th century',
    title: 'The Mongol Empire',
    summary: 'Mongol conquests created the largest contiguous land empire and reshaped exchange across Eurasia.',
  },
  {
    date: 'Mid-14th century',
    title: 'The Black Death',
    summary: 'A devastating plague pandemic transformed populations, economies, and societies across Eurasia and North Africa.',
  },
  {
    date: 'c. 1450',
    title: 'Printing expands in Europe',
    summary: 'Movable-type printing accelerated the circulation of books and ideas in Europe, building on older Asian traditions.',
  },
  {
    date: 'From 1492',
    title: 'Atlantic voyages and the Columbian Exchange',
    summary: 'European expansion connected the Americas with Afro-Eurasia, moving crops, people, diseases, and wealth.',
  },
  {
    date: '1776–1804',
    title: 'Atlantic revolutions',
    summary: 'Revolutions in North America, France, and Haiti challenged imperial rule and older ideas about political rights.',
  },
  {
    date: 'Late 18th–19th centuries',
    title: 'Industrialization',
    summary: 'Mechanized production spread from Britain to other regions, changing work, energy use, and global power.',
  },
  {
    date: '1914–1918',
    title: 'The First World War',
    summary: 'A global conflict ended empires, redrew borders, and shaped the political crises that followed.',
  },
  {
    date: '1939–1945',
    title: 'The Second World War',
    summary: 'War across Europe, Africa, Asia, and the Pacific caused immense loss and remade the international order.',
  },
  {
    date: '1945–1970s',
    title: 'A wave of decolonization',
    summary: 'Independence movements ended many colonial empires and brought dozens of new states into world politics.',
  },
  {
    date: '1947–1991',
    title: 'The Cold War',
    summary: 'Rival blocs competed through diplomacy, arms races, and proxy wars, while newly independent states pursued their own paths.',
  },
  {
    date: 'Late 20th century–present',
    title: 'The digital age',
    summary: 'Computing and the internet transformed communication, commerce, research, and everyday life worldwide.',
  },
];
