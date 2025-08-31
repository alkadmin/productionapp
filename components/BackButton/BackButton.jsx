"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from 'primereact/button';

const BackButton = () => {
  const router = useRouter();

  const goBack = () => {
    router.back();
  };

  return (
    <Button 
      icon="pi pi-arrow-left" 
      className="p-button-secondary p-mr-2" 
      onClick={goBack} 
      label="" 
      text
    />
  );
};

export default BackButton;
