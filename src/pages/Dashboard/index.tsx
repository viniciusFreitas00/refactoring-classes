import { useCallback, useEffect, useState } from 'react';

import { Header } from '../../components/Header';
import { Food } from '../../components/Food';
import { ModalAddFood } from '../../components/ModalAddFood';
import { ModalEditFood } from '../../components/ModalEditFood';
import { FoodsContainer } from './styles';

import api from '../../services/api';

interface FoodResponse {
  id: number;
  name: string;
  description: string;
  price: string;
  available: boolean;
  image: string;
}

interface FoodInterface {
  name: string;
  description: string;
  price: string;
  image: string;
}

export function Dashboard(){
  const [foods, setFoods] = useState<FoodResponse[]>([]);
  const [editingFood, setEditingFood] = useState<FoodResponse>({} as FoodResponse);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    async function getFoods(){
      const response = await api.get<FoodResponse[]>('/foods');
      setFoods(response.data)
    }

    getFoods();
  },[])

  const toggleModal = useCallback(() => {
    setModalOpen(state => !state)
  },[])

  const handleAddFood = useCallback(async (food: FoodInterface) => {
    try {
      const response = await api.post<FoodResponse>('/foods', {
        ...food,
        available: true,
      });

      setFoods(state => [...state, response.data]);
    } catch (err) {
      console.log(err);
    }
  },[])

  const toggleEditModal = useCallback(() => {
    setEditModalOpen(state => !state)
  },[])

  const handleUpdateFood = useCallback(async (food: FoodInterface) => {
    try {
      const foodUpdated = await api.put<FoodResponse>(
        `/foods/${editingFood.id}`,
        { ...editingFood, ...food },
      );

      const foodsUpdated = foods.map(food => food.id === foodUpdated.data.id ? foodUpdated.data : food)

      setFoods(foodsUpdated);
    } catch (err) {
      console.log(err);
    }
  },[foods, editingFood])

  const handleDeleteFood = useCallback(async (id: number) => {
    await api.delete(`/foods/${id}`);

    const foodsFiltered = foods.filter(food => food.id !== id);

    setFoods(foodsFiltered);
  },[foods])
 

  const handleEditFood = useCallback((food: FoodResponse) => {
    setEditingFood(food)
    setEditModalOpen(true)
  },[])

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
       <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  );
}
