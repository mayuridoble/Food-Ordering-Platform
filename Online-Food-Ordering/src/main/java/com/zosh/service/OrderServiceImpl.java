package com.zosh.service;

import com.zosh.model.*;
import com.zosh.repository.AddressRepository;
import com.zosh.repository.OrderItemRepository;
import com.zosh.repository.OrderRepository;
import com.zosh.repository.UserRepository;
import com.zosh.request.OrderRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import static java.awt.geom.Path2D.contains;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private RestaurantService restaurantService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private CartService cartService;


    @Override
    public Order createOrder(OrderRequest order, User user) throws Exception {

        Address shippAddress=order.getDeliveryAddress();
        Address savedAddress=addressRepository.save(shippAddress);
        if(user.getAddresses().contains(savedAddress)) {
            user.getAddresses().add(savedAddress);
            userRepository.save(user);
        }
            Restaurant restaurant=restaurantService.findRestaurantById(order.getRestaurantId());
            Order createdOrder=new Order();
            createdOrder.setCustomer(user);
            createdOrder.setCreatedAt(new Date());
            createdOrder.setOrderStatus("PENDING");
            createdOrder.setDeliveryAddress(savedAddress) ;
            createdOrder.setRestaurant(restaurant);
            Cart cart=cartService.findCartByUserId(user.getId());


        List<OrderItems> orderItems=new ArrayList<>();
        for (CartItem cartItem : cart.getItem()) {
            OrderItems orderItem = new OrderItems();
            orderItem.setFood(cartItem.getFood());
            orderItem.setIngredients(cartItem.getIngredients());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setTotalPrice(cartItem.getTotalPrice());
            OrderItems savedOrderItem = orderItemRepository.save(orderItem);
            orderItems.add(savedOrderItem);
        }
            Long totalPrice = cartService.calculateCartTotals(cart);
            createdOrder.setItems(orderItems);
            createdOrder.setTotalPrice(totalPrice);

            Order savedOrder = orderRepository.save(createdOrder);
            restaurant.getOrders().add(savedOrder);

            return createdOrder;
    }

    @Override
    public Order updateOrder(Long orderId, String orderStatus) throws Exception {
        Order order=findOrderById(orderId) ;
        if(orderStatus.equals("OUT_FOR_DELIVERY")
        ||orderStatus. equals ("DELIVERED" )
        ||orderStatus. equals ("COMPLETED")
                ||orderStatus.equals("PENDING"))
        {
            order.setOrderStatus(orderStatus);
            return orderRepository.save(order);
        }
            throw new Exception("Please select a valid order status") ;
    }

    @Override
    public void calcelorder(Long orderId) throws Exception {

        Order order = findOrderById(orderId);
        orderRepository.deleteById(orderId);

    }
    @Override
    public List<Order> getOrderService(Long userid)
    {
        return orderRepository.findByCustomerId(userid);
    }

    @Override
    public List<Order> getRestaurantsOrder(Long restaurantId,String orderStatus) throws Exception {
        List<Order> orders= orderRepository.findByRestaurantId(restaurantId);
        if(orderStatus!=null) orders=orders.stream().filter(order->order.getOrderStatus().equals(orderStatus)).collect(Collectors.toList());
        return orders;
    }

    @Override
    public Order findOrderById(Long orderId) throws Exception {
        Optional<Order>optionalOrder = orderRepository.findById(orderId);

        if(optionalOrder.isEmpty()) throw new Exception(("order not found..."));


        return optionalOrder.get();
    }
}
