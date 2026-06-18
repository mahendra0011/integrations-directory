import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import IntegrationCard from './IntegrationCard';

export default function IntegrationGrid({ integrations, filter, limit }) {
  const navigate = useNavigate();

  const filtered =
    filter === 'all'
      ? integrations
      : integrations.filter((d) => d.cat === filter);

  const displayed = limit ? filtered.slice(0, limit) : filtered;

  return (
    <div className="max-w-[1150px] mx-auto grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-4">
      {displayed.map((item) => (
        <IntegrationCard
          key={item.id}
          integration={item}
          onClick={(id) => navigate(`/integration/${id}`)}
        />
      ))}
    </div>
  );
}