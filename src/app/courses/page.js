
'use client'
import  { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/dash.css';


const Dashboard = () => {
  const [courses, setCourses] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [email, setEmail] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {

    fetchData();
    fetchWishlist();
    fetchCartItems();
  }, [email]);
 

  const fetchData = async () => {
    try {
      const [coursesResponse] = await Promise.all([
        axios.get('/api/courses'),
        
      ]);
      const approvedCourses = coursesResponse.data.filter(course => course.isapproved);

      setCourses(approvedCourses);
      
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchWishlist = async () => {
    const storedEmail = localStorage.getItem('Email');
    if(storedEmail) {
      console.log("stored email:",storedEmail)
      setEmail(storedEmail);
      setIsLoggedIn(true);
    }
    try {
      const response = await axios.get(`/api/wishlist`,{email:email});
      setWishlist(response.data);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };
  const fetchCartItems = async () => {
    if (!email) return; 
    try {
      const response = await axios.get('/api/cart', { params: { email } });
      setCartItems(response.data);
    } catch (error) {
      console.error('Error fetching cart items:', error);
    }
  };

  
  const toggleWishlist = async (course) => {

      if(!isLoggedIn) {
        window.location.href = '/signup';
        return;
      } else {
      const courseInWishlist = wishlist.some(item => item.courseCode === course.courseCode);
      if(courseInWishlist) {
        try {
          await axios.delete('/api/wishlist', {
          data: { email, courseCode: course.courseCode }
        })
        setWishlist(wishlist.filter(item => item.courseCode !== course.courseCode));
        } catch(error) {
          console.error('Error removing from the wishlist:', error );
        }
      } else {
        try {
          await axios.post('/api/wishlist', {
            email,
            courseCode: course.courseCode,
          })
        setWishlist([...wishlist,{email,courseCode: course.courseCode}]);
        } catch(error) {
          console.error('Error adding to the wishlist:', error);
        }
      }
    }
  };

  const handleAddToCart = async (courseId) => {
    if (!isLoggedIn) {
      window.location.href = '/signup';
      return;
    }
    // Check if the course is already in the cart
    if (cartItems.some(item => item.courseId._id === courseId)) {
      alert("Course is already in the cart.");
      return;
    }

    try {
      await axios.post('/api/cart', {
        email,
        courseId,
        isadded: true,
      });

      // Fetch updated cart items
      fetchCartItems();
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };


  return (
    <>
    
    <div className= "dashboard-container">
     
     
            {courses.map((course) => (
          <div key={course._id} className="small-div"
         >
          {isLoggedIn && (
              <span
                className={`wishlist-icon  ${wishlist.some(item => item.courseCode === course.courseCode) ? 'wishlist-icon-true' : 'wishlist-icon-false'}`}
                onClick={() => toggleWishlist(course)}
              >
                ★
              </span>
            )}
          <div
           style={{ 
            backgroundImage: course.image ? `url(${course.image})` : 'none',
            backgroundSize: 'cover', 
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            height: '150px', // Ensure height is sufficient to show the image
        }}>
        </div>
        {/* Wishlist Icon */}
{/*         
          {console.log(course.image)} */}
            <p className="text">Course name:{course.courseName}</p>
            <p className="text">Course code:{course.courseCode}</p>
            <p className="text">Instructor name:{course.instructor}</p>
            <p className="text">student List:{course.Std_Eld}</p>
            <div className="add-to-cart-container">
              <button onClick={() => handleAddToCart(course._id)} className="add-to-cart-button">Add to cart</button>
            </div>
          </div>
        ))}
        
      
     
    </div>
    
    </>
  );
};

export default Dashboard;
