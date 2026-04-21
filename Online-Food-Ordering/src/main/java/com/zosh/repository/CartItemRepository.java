package com.zosh.repository;

import com.zosh.model.Cart;
import com.zosh.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CartItemRepository extends JpaRepository<CartItem,Long> {

    public List<CartItem> findByCart_CustomerId(Long customerId);
}
