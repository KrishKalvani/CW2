//setting up the vue instance
let webstore = new Vue({
  el: '#app', //element, we're calling it 'app' which is the whole functioning website
  data: { //this is where we add in our data object and in this we have the lessons array containing 10 lesson object. We also have the order object.
    sitename: 'AfterSchool', //displays the sitename in the vue js console
    showLesson: true, //initially lessons are displayed, if false then the checkout toggle appears and the lessons display hides
    searchValue: '',
    order: { //order object that is setting the name and phone credentials to be filled by the user
      name: '',
      phone: null

    },
    lessons: [], //lessons array containing 10 lesson objects
    cart: [], //this is the cart array that stores the IDs of the lessons and will be used to display the lessons in the cart page dynamically
    sortOrder: 'ascending',//this will change to descending and back to ascending depending on the button clicked in the html page
  },
  created: function () {
    this.fetchLessons(); //calling the function
  },
  methods: {

    fetchLessons: function () { //makes a get request to the server's /lessons route
      fetch('http://localhost:3000/lessons')
        .then(response => response.json()) //when this gets the response from the server, this will take the response and read it as JSON
        .then(data => { //then we update the lessons array
          this.lessons = data; //replace the empty lessons array with data fetched from server
        })
        .catch(error => console.error('Error fetching lessons:', error)); //error handling
    },
    
    
    submitOrder: function () {
      if (this.cart.length === 0) { //checks if cart length is 0, if so, then make sure user adds something to the cart
        alert('Please add lessons to your cart to place an order.');
        return; //exit the function if the cart is empty
      }

      //make the order data if cart is not empty
      const orderData = { //setting up how the document should be like in MongoDB
        name: this.order.name, //taken from the order vue object.
        phoneNumber: this.order.phone,
        //we take the cartItems array and we will construct the mongoDB cart array
        cart: this.cartItems.reduce((acc, lesson) => {//accumulator and the current lesson being processed
          //each item in cart is an object with lesson details
          if (!acc[lesson.id]) { //checks if the lesson.id (key) is not added
            acc[lesson.id] = { spaces: 0 }; //if the condition is true, then set this up
          }
          acc[lesson.id].spaces += 1; //counts and increments how many times a particular lesson has been added in the cart.
          return acc; //goes to the next iteration or returns the final acc when the process is complete.
        }, {})
      };

      //the acc stores an object which has the lesson ID and maps that to the corresponding object which contains spaces details.

      //send the order data to the server
      fetch('http://localhost:3000/orders', { //sends a post request
        method: 'POST', //specifying http request
        headers: { //telling the server that the body of the request is JSON
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData), //we have to stringify the orderData JS object to send it as HTTP request
      })
        .then(response => response.json()) //reads the response as json
        .then(data => { //logs the result to the console
          console.log('Order submitted:', data);
          alert('Order Submitted. Thank you!');
          this.cart = []; //this.cart is my cart array
          // this.cartItemCount = 0;
        })
        .catch(error => { //error handling
          console.error('Error submitting order:', error);
          alert('Error submitting order. Please try again.');
        });

      // //updating the lesson spaces with PUT
      // const spaceUpdates = this.cartItems.map(item => {
      //   return {
      //     lessonId: item.id,
      //     decrement: item.cartItemCount //the number to decrement the spaces by
      //   };
      // });

      // //Now we send a PUT request to update the spaces
      // fetch('http://localhost:3000/lessons/update-spaces', {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(spaceUpdates),
      // })
      //   .then(response => response.json())
      //   .then(data => {
      //     console.log('Spaces updated:', data);
      //   })
      //   .catch(error => {
      //     console.error('Error updating spaces:', error);
      //   });

    },


    addToCart: function (lesson) { //this function adds the IDs of each lesson thats added in the cart
      if (lesson.spaces > lesson.cartItemCount) { //if the spaces left of the lesson is more that whats in the cart
        lesson.cartItemCount++ //then we can add it (increment the cartItemCount value)
        this.cart.push(lesson.id); //literally adding/pushing the lesson ID in the cart array
       
        
      }


    },
    showCheckout() {
      this.showLesson = this.showLesson ? false : true; //this is triggered by v-show where it uses terinary operators so true
      //will trigger the checkout and false will hide it and show the lessons
    },
    canAddToCart: function (lesson) { //checks if we can add to the cart or not, we put this in a v-if else so we can disable the add to cart button
      return lesson.spaces > lesson.cartItemCount; //checks if the spaces is more than the lessons that have been added
    },
    sortByPrice: function (order) {//order is the parameter where it will either be ascending or descending
      this.sortOrder = order; //storing it on sortOrder
      this.lessons.sort((a, b) => { //lets assume a and b are the objects (each lesson) in our lessons array, sort performs the ascending 
        //and descending/sorting
        if (order === 'ascending') {//if order is ascedning...
          return a.price - b.price;//display the first detected lesson minus the 2nd one
        } else if (order === 'descending') {// similarly for descending but 2nd lesson minus the 1st
          return b.price - a.price;
        }
        return 0; // this will not display any change if theres no ascending or descending detected
      });
    },

    sortAlphabetically: function (order) {//sorting the subjects, using localeCompare as its used for arrange strings
      this.sortOrder = order;
      this.lessons.sort((a, b) => {
        if (order === 'ascending') {
          return a.subject.localeCompare(b.subject); //localeCompare compares 2 strings and returns a value that shows their order
          //if one string (A) is before another string (B), it will return a -ve number and sort in ascending order
        } else if (order === 'descending') { //Similar concept for (B) before (A) i.e., descending order
          return b.subject.localeCompare(a.subject);
        }
        return 0;
      });
    },





    sortLocationAlphabetically: function (order) {//sorting the location, using localeCompare as its used for arrange strings
      this.sortOrder = order;
      this.lessons.sort((a, b) => {
        if (order === 'ascending') {
          return a.location.localeCompare(b.location); //localeCompare compares 2 strings and returns a value that shows their order
          //if one string (A) is before another string (B), it will return a -ve number and sort in ascending order
        } else if (order === 'descending') { //Similar concept for (B) before (A) i.e., descending order
          return b.location.localeCompare(a.location);
        }
        return 0;
      });
    },

    sortBySpaces: function (order) {//order is the parameter where it will either be ascending or descending
      this.sortOrder = order;
      this.lessons.sort((a, b) => { //lets assume a and b are the objects (each lesson) in our lessons array, sort performs the ascending 
        //and descending
        if (order === 'ascending') {//if order is ascedning...
          return (a.spaces - a.cartItemCount) - (b.spaces - b.cartItemCount);//display the first detected lesson minus the 2nd one but here
          //we dynamically check the cartItemCount's value (from each lesson) to sort the spaces
        } else if (order === 'descending') {// similarly for descending but 2nd lesson minus the 1st
          return (b.spaces - b.cartItemCount) - (a.spaces - a.cartItemCount);
        }
        return 0; // this will not display any change if theres no ascending or descending detected
      });
    },

    removeLessonFromCart(lesson) {
      //this function is used for removing lessons from the cart
      let lessonIndexInCart = this.cart.indexOf(lesson.id);//this is finding the index of the lesson thats in the cart
      //and stored in the lessonIndexInCart variable
      if (lessonIndexInCart !== -1) {//if the lesson is IN the cart, then we splice to remove it
        this.cart.splice(lessonIndexInCart, 1);
        let lessonInLesson = this.lessons.find((lessonInCart) => lessonInCart.id === lesson.id);
        //this line searches for the same lesson added in the lessons array (after removing it) using the ID and it stores it in lessonInLessons
        if (lessonInLesson) {//if that lesson is in the array then decrease the cartItemCount which hence increases the spaces.
          lessonInLesson.cartItemCount--;
         
        }
      }
    },

  },

  computed: {
    cartItems: function () { //this is a function that is making an array - cartItems of lesson objects
      // which will contain the IDs (and other details - the whole object) of the lessons that got added into the cart array
      return this.cart.map(itemID => { //here we 'map' the lessons in the cart array into the arguement itemID.
        // So for each itemID (lesson ID) in the cart array, the map function will run to create the new array
        return this.lessons.find(lesson => lesson.id === itemID)
        //Inside the map function the 'find' searches for a lesson where 
        //the lesson.id from the lessons object is equal to the current itemID from the new array made
      });

      //reference: https://v2.vuejs.org/v2/guide/list

    },
    cartItemCount: function () {//this is just giving us the total number of lessons in the cart, this is also present for each lesson object
      return this.cart.length || '';
    },
    cartTotalPrice: function () {
      return this.cartItems.reduce((total, item) => total + item.price, 0);
      //this function calculates the total price of the lessons that are in the cart
      //the reduce function iterates over the cartItems array and adds the price values.
      //it uses total and item as the 2 arguements
      //reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce
    },

    nameValidation: function () {//this checks if we are typing only letters
      return /^[A-Za-z\s]+$/.test(this.order.name);
    },
    phoneValidation: function () { //this checks if we are typing only numbers
      return /^[0-9]+$/.test(this.order.phone);
    },
    credentialsValidation: function () { //this checks if both are correct and then disabled if its not correct, from the html side
      return this.nameValidation && this.phoneValidation;
    },


    // lessonList(){ //this searches the lesson by the subject
    //   if(this.searchValue.trim().length>0){//if something is searched then searchValue is greater than 0
    //     return this.lessons.filter((lesson)=>lesson.subject.toLowerCase().includes(this.searchValue.trim().toLowerCase()))
    //   }//we filter the lesson for each lesson if the lessons subject includes the value we searched, then return it.

    // lessonList(){ // i modified the previouse code to search by location as well
    //   if(this.searchValue.trim().length>0){ //if the user searches something
    //     return (this.lessons.filter((lesson)=>{// then return the following
    //       let lowerCaseSearch= this.searchValue.trim().toLowerCase(); //this stores all the search values in lowerCase
    //       let subjectSearch= lesson.subject.toLowerCase().includes(lowerCaseSearch);//searches by subject, we lowerCase the subject so we can get
    //       //results for searching a small letter, we do the lowerCasing during the search (in the includes) so that we can search big letters, we just want to make it
    //       //case insensitive
    //       let locationSearch= lesson.location.toLowerCase().includes(lowerCaseSearch);
    //       return subjectSearch||locationSearch;

    //     }));


    //   }
    //   return this.lessons;//this displays all the lessons at default when nothing is searched

    // }
    //reference for the searching: https://www.youtube.com/watch?v=0TMy-5srdlA&list=LL&index=1&t=818s


  },
});


