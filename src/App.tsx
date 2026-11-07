import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

type Status = 'todo' | 'doing' | 'done';

interface Card {
  id: string;
  title: string;
  status: Status;
}

const API_URL = '[https://kanban-backend-1-6598.onrender.com/](https://kanban-backend-1-6598.onrender.com/)'; // Replace with Cloud Run URL later

export default function App() {
  const [cards, setCards] = useState<Card[]>([]);
  const [newCardTitle, setNewCardTitle] = useState('');

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const { data } = await axios.get<Card[]>(`${API_URL}/cards`);
      setCards(data);
    } catch (error) {
      console.error("Error fetching cards", error);
    }
  };

  const addCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardTitle.trim()) return;
    const { data } = await axios.post<Card>(`${API_URL}/cards`, { title: newCardTitle, status: 'todo' });
    setCards([...cards, data]);
    setNewCardTitle('');
  };

  const updateCardStatus = async (id: string, newStatus: Status) => {
    await axios.put(`${API_URL}/cards/${id}`, { status: newStatus });
    setCards(cards.map(card => (card.id === id ? { ...card, status: newStatus } : card)));
  };

  const deleteCard = async (id: string) => {
    await axios.delete(`${API_URL}/cards/${id}`);
    setCards(cards.filter(card => card.id !== id));
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('cardId', id);
  };

  const handleDrop = (e: React.DragEvent, status: Status) => {
    const cardId = e.dataTransfer.getData('cardId');
    if (cardId) updateCardStatus(cardId, status);
  };

  const columns: { label: string; value: Status }[] = [
    { label: 'To Do', value: 'todo' },
    { label: 'Doing', value: 'doing' },
    { label: 'Done', value: 'done' },
  ];

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Kanban Board</h1>
      
      <form onSubmit={addCard} style={{ marginBottom: '2rem' }}>
        <input 
          value={newCardTitle} 
          onChange={(e) => setNewCardTitle(e.target.value)} 
          placeholder="New task..."
          style={{ padding: '0.5rem', marginRight: '0.5rem' }}
        />
        <button type="submit" style={{ padding: '0.5rem' }}>Add Card</button>
      </form>

      <div style={{ display: 'flex', gap: '2rem' }}>
        {columns.map(column => (
          <div 
            key={column.value}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, column.value)}
            style={{ flex: 1, backgroundColor: '#f4f4f5', padding: '1rem', borderRadius: '8px', minHeight: '300px' }}
          >
            <h2>{column.label}</h2>
            {cards.filter(card => card.status === column.value).map(card => (
              <div 
                key={card.id}
                draggable
                onDragStart={(e) => handleDragStart(e, card.id)}
                style={{ backgroundColor: 'white', padding: '1rem', margin: '0.5rem 0', borderRadius: '4px', cursor: 'grab', display: 'flex', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
              >
                <span>{card.title}</span>
                <button onClick={() => deleteCard(card.id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>X</button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
