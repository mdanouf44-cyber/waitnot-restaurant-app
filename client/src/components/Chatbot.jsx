import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import axios from 'axios';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm your intelligent food assistant. I can analyze our restaurants and recommend the best options for you. Ask me about:\n• Top rated restaurants\n• Best food items\n• Popular cuisines\n• Restaurant recommendations\n• Menu item ratings",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const [restaurantsData, setRestaurantsData] = useState([]);
  const [reviewsData, setReviewsData] = useState([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch restaurants and reviews data when chatbot opens
  useEffect(() => {
    if (isOpen && restaurantsData.length === 0) {
      fetchAppData();
    }
  }, [isOpen]);

  const fetchAppData = async () => {
    try {
      const [restaurantsRes, reviewsRes] = await Promise.all([
        axios.get('/api/restaurants/search'),
        axios.get('/api/reviews')
      ]);
      setRestaurantsData(restaurantsRes.data);
      setReviewsData(reviewsRes.data);
    } catch (error) {
      console.error('Error fetching app data:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages([...messages, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Get intelligent bot response
    setTimeout(async () => {
      const botResponse = await getBotResponse(inputMessage);
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      }]);
    }, 800);
  };

  const placeAutomaticOrder = async (item, restaurants) => {
    try {
      // Check if user is logged in
      const token = localStorage.getItem('userToken');
      const userData = localStorage.getItem('user');

      if (!token || !userData) {
        return "❌ Please log in first to place an order. You can log in from the profile section.";
      }

      const user = JSON.parse(userData);

      // Check if user has address
      if (!user.address) {
        return "❌ Please add your delivery address in your profile before placing an order.";
      }

      // Check if we have restaurant ID
      if (!item.restaurantId) {
        return "❌ Sorry, I couldn't find the restaurant information for this item.";
      }

      // Create order payload
      const orderData = {
        items: [{
          name: item.name,
          price: item.price,
          quantity: 1
        }],
        totalAmount: item.price,
        deliveryAddress: user.address,
        paymentMethod: 'cash',
        paymentStatus: 'pending',
        orderType: 'delivery',
        restaurantId: item.restaurantId
      };

      // Place the order
      const response = await axios.post('/api/users/orders', orderData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data) {
        return `✅ Order Placed Successfully!\n\n📦 Order Details:\n• ${item.name}\n• ⭐ ${item.rating}/5\n• 💰 ₹${item.price}\n• 📍 ${item.restaurantName}\n\n👤 Delivery To:\n• ${user.name}\n• 📞 ${user.phone}\n• 🏠 ${user.address}\n\n💳 Payment: Cash on Delivery\n\n🚚 Your order will be delivered soon! You can track it in the Order History section.`;
      }
    } catch (error) {
      console.error('Order placement error:', error);
      return `❌ Sorry, I couldn't place your order. ${error.response?.data?.message || 'Please try again or place the order manually.'}`;
    }
  };

  const getBotResponse = async (message) => {
    const lowerMessage = message.toLowerCase();

    // Ensure data is loaded
    if (restaurantsData.length === 0) {
      try {
        const { data } = await axios.get('/api/restaurants/search');
        setRestaurantsData(data);
        // Re-process the message with loaded data
        return await processMessage(lowerMessage, data, reviewsData);
      } catch (error) {
        return "Sorry, I'm having trouble connecting to the server. Please try again!";
      }
    }

    return await processMessage(lowerMessage, restaurantsData, reviewsData);
  };

  const processMessage = async (lowerMessage, restaurants, reviews) => {
    // Check if user wants to order something
    const orderKeywords = ['order', 'buy', 'get me', 'i want', 'place order', 'order for me'];
    const wantsToOrder = orderKeywords.some(keyword => lowerMessage.includes(keyword));

    // Search for specific food items by name (e.g., "best chocolate shake", "where can I get pizza")
    const foodKeywords = ['shake', 'pizza', 'burger', 'biryani', 'pasta', 'sandwich', 'coffee', 'tea', 'cake', 'ice cream', 'noodles', 'rice', 'chicken', 'paneer', 'dal', 'roti', 'naan', 'samosa', 'dosa', 'idli', 'vada'];
    const hasSpecificFood = foodKeywords.some(keyword => lowerMessage.includes(keyword));
    
    if (hasSpecificFood || (lowerMessage.includes('best') && !lowerMessage.includes('restaurant'))) {
      // Extract the food item name from the message
      const allMenuItems = [];
      restaurants.forEach(restaurant => {
        restaurant.menu?.forEach(item => {
          allMenuItems.push({
            ...item,
            restaurantName: restaurant.name,
            restaurantRating: restaurant.rating,
            restaurantId: restaurant._id
          });
        });
      });

      // Find items that match the search query
      const matchingItems = allMenuItems.filter(item => {
        const itemName = item.name.toLowerCase();
        // Check if any word in the message matches the item name
        return lowerMessage.split(' ').some(word => 
          itemName.includes(word) || word.includes(itemName.split(' ')[0])
        );
      });

      if (matchingItems.length > 0) {
        // Sort by rating (highest first), then by restaurant rating
        const sortedItems = matchingItems.sort((a, b) => {
          const ratingDiff = (b.rating || 0) - (a.rating || 0);
          if (ratingDiff !== 0) return ratingDiff;
          return (b.restaurantRating || 0) - (a.restaurantRating || 0);
        });
        
        // Get top 3 best-rated items
        const topMatches = sortedItems.slice(0, 3);

        // If user wants to order, automatically place the order for the best item
        if (wantsToOrder && topMatches.length > 0) {
          return await placeAutomaticOrder(topMatches[0], restaurants);
        }

        let response = `🏆 Top 3 Best Recommendations:\n\n`;
        topMatches.forEach((item, i) => {
          response += `${i + 1}. ${item.name}\n`;
          if (item.rating) {
            response += `   ⭐ ${item.rating}/5 - Highly Rated!\n`;
          }
          response += `   💰 ₹${item.price}\n`;
          response += `   📍 ${item.restaurantName}`;
          if (item.restaurantRating) {
            response += ` (${item.restaurantRating}⭐)`;
          }
          response += `\n`;
          if (item.description) response += `   📝 ${item.description}\n`;
          response += `\n`;
        });
        
        if (matchingItems.length > 3) {
          response += `💡 ${matchingItems.length - 3} more option(s) available. These are our top picks based on ratings and customer feedback!`;
        } else {
          response += `✨ These are the best options based on ratings and customer feedback!`;
        }
        
        return response;
      }
    }

    // Top rated restaurants
    if (lowerMessage.includes('top') && (lowerMessage.includes('restaurant') || lowerMessage.includes('rated'))) {
      const topRestaurants = [...restaurants]
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 5);
      
      if (topRestaurants.length === 0) {
        return "No restaurants found at the moment. Please check back later!";
      }

      let response = "🌟 Here are our top-rated restaurants:\n\n";
      topRestaurants.forEach((r, i) => {
        response += `${i + 1}. ${r.name}\n   ⭐ ${r.rating}/5 | ${r.cuisine?.join(', ')}\n   🕐 ${r.deliveryTime}\n\n`;
      });
      return response;
    }

    // Best food recommendations
    if (lowerMessage.includes('best') && (lowerMessage.includes('food') || lowerMessage.includes('dish') || lowerMessage.includes('item'))) {
      const allMenuItems = [];
      restaurants.forEach(restaurant => {
        restaurant.menu?.forEach(item => {
          allMenuItems.push({
            ...item,
            restaurantName: restaurant.name,
            restaurantRating: restaurant.rating
          });
        });
      });

      const topItems = allMenuItems
        .filter(item => item.rating && item.rating > 4)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 5);

      if (topItems.length === 0) {
        return "All our restaurants serve delicious food! Browse the menu to find your favorites.";
      }

      let response = "🍽️ Top-rated food items:\n\n";
      topItems.forEach((item, i) => {
        response += `${i + 1}. ${item.name}\n   ⭐ ${item.rating}/5 | ₹${item.price}\n   📍 ${item.restaurantName}\n\n`;
      });
      return response;
    }

    // Restaurant recommendations
    if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest') || lowerMessage.includes('best restaurant')) {
      const highRatedRestaurants = restaurants
        .filter(r => r.rating >= 4)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 3);

      if (highRatedRestaurants.length === 0) {
        // If no 4+ rated, show top 3 anyway
        const topRestaurants = [...restaurants]
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 3);
        
        if (topRestaurants.length === 0) {
          return "Check out the home page to explore our restaurants!";
        }

        let response = "Here are our top restaurants:\n\n";
        topRestaurants.forEach((r, i) => {
          response += `${i + 1}. ${r.name}\n   ⭐ ${r.rating}/5\n   🍴 ${r.cuisine?.join(', ')}\n   ${r.isDeliveryAvailable ? '🚚 Delivery available' : '🏪 Dine-in only'}\n\n`;
        });
        return response;
      }

      let response = "Based on ratings and popularity, I recommend:\n\n";
      highRatedRestaurants.forEach((r, i) => {
        response += `${i + 1}. ${r.name}\n   ⭐ ${r.rating}/5\n   🍴 ${r.cuisine?.join(', ')}\n   ${r.isDeliveryAvailable ? '🚚 Delivery available' : '🏪 Dine-in only'}\n\n`;
      });
      return response;
    }

    // Cuisine-based search
    if (lowerMessage.includes('cuisine') || lowerMessage.includes('chinese') || lowerMessage.includes('indian') || 
        lowerMessage.includes('italian') || lowerMessage.includes('mexican') || lowerMessage.includes('pizza') ||
        lowerMessage.includes('burger') || lowerMessage.includes('biryani')) {
      
      const cuisineKeywords = ['chinese', 'indian', 'italian', 'mexican', 'pizza', 'burger', 'biryani', 'fast food'];
      const foundCuisine = cuisineKeywords.find(c => lowerMessage.includes(c));

      if (foundCuisine) {
        const matchingRestaurants = restaurants.filter(r => 
          r.cuisine?.some(c => c.toLowerCase().includes(foundCuisine)) ||
          r.name.toLowerCase().includes(foundCuisine)
        );

        if (matchingRestaurants.length > 0) {
          let response = `🍴 Restaurants serving ${foundCuisine}:\n\n`;
          matchingRestaurants.slice(0, 5).forEach((r, i) => {
            response += `${i + 1}. ${r.name}\n   ⭐ ${r.rating}/5 | 🕐 ${r.deliveryTime}\n\n`;
          });
          return response;
        }
      }
    }

    // Reviews and ratings
    if (lowerMessage.includes('review') || lowerMessage.includes('feedback')) {
      const recentReviews = reviews.slice(0, 3);
      
      if (recentReviews.length === 0) {
        return "No reviews yet! Be the first to share your experience.";
      }

      let response = "📝 Recent customer reviews:\n\n";
      recentReviews.forEach((review, i) => {
        response += `⭐ ${review.rating}/5 - "${review.comment}"\n`;
        if (i < recentReviews.length - 1) response += "\n";
      });
      return response;
    }

    // Fast delivery
    if (lowerMessage.includes('fast') || lowerMessage.includes('quick') || lowerMessage.includes('delivery time')) {
      const fastRestaurants = restaurants
        .filter(r => r.deliveryTime && parseInt(r.deliveryTime) <= 30)
        .sort((a, b) => parseInt(a.deliveryTime) - parseInt(b.deliveryTime))
        .slice(0, 5);

      if (fastRestaurants.length > 0) {
        let response = "⚡ Fastest delivery restaurants:\n\n";
        fastRestaurants.forEach((r, i) => {
          response += `${i + 1}. ${r.name}\n   🕐 ${r.deliveryTime} | ⭐ ${r.rating}/5\n\n`;
        });
        return response;
      }
    }

    // Statistics
    if (lowerMessage.includes('how many') || lowerMessage.includes('total') || lowerMessage.includes('statistics')) {
      const totalRestaurants = restaurants.length;
      const avgRating = totalRestaurants > 0 ? (restaurants.reduce((sum, r) => sum + r.rating, 0) / totalRestaurants).toFixed(1) : 0;
      const totalReviews = reviews.length;

      return `📊 App Statistics:\n\n🏪 Total Restaurants: ${totalRestaurants}\n⭐ Average Rating: ${avgRating}/5\n📝 Total Reviews: ${totalReviews}\n\nWe're constantly growing to serve you better!`;
    }

    // Default intelligent response
    return "I can help you discover:\n\n🌟 Top-rated restaurants\n🍽️ Best food items\n🍴 Cuisine recommendations\n⚡ Fast delivery options\n📊 App statistics\n\nJust ask me anything about our restaurants and food!";
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 right-4 z-50 bg-primary text-white p-4 rounded-full shadow-lg hover:bg-red-600 transition-all duration-300 hover:scale-110"
          aria-label="Open chat"
        >
          <MessageCircle size={28} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-80 sm:w-96 h-[500px] bg-white dark:bg-gray-800 rounded-lg shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* Chat Header */}
          <div className="bg-primary text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle size={24} />
              <div>
                <h3 className="font-bold">Food Assistant</h3>
                <p className="text-xs opacity-90">Online</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-red-600 rounded-full transition-colors"
              aria-label="Close chat"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-lg p-3 ${
                    message.sender === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.text}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender === 'user' ? 'text-red-100' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="bg-primary text-white p-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
