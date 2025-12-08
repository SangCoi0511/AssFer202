import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { FiStar, FiTrendingUp, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import '../styles/Home.css';

const Home = () => {
  const { products, categories, loading } = useShop();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Welcome to MiniShop",
      subtitle: "Discover amazing products at unbeatable prices",
      buttonText: "Shop Now",
      buttonLink: "/shop",
      bgImage: "/Image/banner1.png"
    },
    {
      title: "Flash Sales Today!",
      subtitle: "Up to 50% off on selected items",
      buttonText: "View Deals",
      buttonLink: "/flash-sales",
      bgImage: "/Image/banner2.png"
    },
    {
      title: "New Arrivals",
      subtitle: "Check out our latest collection",
      buttonText: "Explore New",
      buttonLink: "/new-arrivals",
      bgImage: "/Image/banner3.png"
    },
    {
      title: "Premium Quality",
      subtitle: "Top-rated products from trusted sellers",
      buttonText: "Browse All",
      buttonLink: "/shop",
      bgImage: "/Image/banner4.png"
    }
  ];

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  const featuredProducts = products.slice(0, 8);
  const topRatedProducts = [...products]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4);

  return (
    <div className="home-page">
      {/* Carousel Hero Section */}
      <section className="hero-carousel">
        <div className="carousel-container">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
              style={{ backgroundImage: `url(${slide.bgImage})` }}
            >
              <div className="carousel-overlay"></div>
              <div className="hero-content">
                <h1>{slide.title}</h1>
                <p>{slide.subtitle}</p>
                <Link to={slide.buttonLink} className="btn-hero">
                  {slide.buttonText}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button className="carousel-btn prev" onClick={prevSlide}>
          <FiChevronLeft />
        </button>
        <button className="carousel-btn next" onClick={nextSlide}>
          <FiChevronRight />
        </button>

        {/* Dots Indicator */}
        <div className="carousel-dots">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <h2>Shop by Category</h2>
        <div className="categories-grid">
          {categories.map(category => (
            <Link
              key={category.id}
              to={`/shop?category=${category.id}`}
              className="category-card"
            >
              <h3>{category.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-section">
        <div className="section-header">
          <h2>Featured Products</h2>
          <Link to="/shop" className="view-all">View All</Link>
        </div>
        <div className="products-grid">
          {featuredProducts.map(product => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="product-card"
            >
              <div className="product-image">
                <img src={product.image} alt={product.name} />
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <div className="product-rating">
                  <FiStar className="star-icon" />
                  <span>{product.rating}</span>
                </div>
                <div className="product-price">${product.price}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Top Rated Products */}
      <section className="top-rated-section">
        <div className="section-header">
          <h2><FiTrendingUp /> Top Rated</h2>
        </div>
        <div className="products-grid">
          {topRatedProducts.map(product => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="product-card"
            >
              <div className="product-image">
                <img src={product.image} alt={product.name} />
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <div className="product-rating">
                  <FiStar className="star-icon" />
                  <span>{product.rating}</span>
                </div>
                <div className="product-price">${product.price}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

    
    </div>
  );
};

export default Home;
