package com.zosh.service;

import com.zosh.model.IngredientCategory;
import com.zosh.model.IngredientsItems;

import java.util.List;

public interface IngreduentsService {

    public IngredientCategory createIngredientCategory(String name , Long restaurant)throws Exception;

    public IngredientCategory findIngredientCategory( Long id)throws Exception;
    public List<IngredientCategory> findIngredientCategoryByRestaurantId(Long id)throws Exception;
    public IngredientsItems createIngredientItem(long restaurantId,String ingredientName,Long categoryId)throws Exception;
    public List<IngredientsItems> findRestaurantIngredientsItem(Long id)throws Exception;

    public IngredientsItems updateStock(Long id)throws Exception;




}
