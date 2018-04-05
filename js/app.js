// Initializations in local storage; avoid errors on first run on any browser
if (localStorage.contacts == null) {
  localStorage.contacts = JSON.stringify([]);
}
if (localStorage.idOfContactBeingEdited == null) {
  localStorage.idOfContactBeingEdited = JSON.stringify(0);
}

//
/*************** add previously stored contacts to DOM ***************/
(function () {
  // attempt to retrieve previously stored contacts for display
  var contacts = getStoredContacts();
  contacts.forEach(function(contact) {displayContact(contact)});
  displaySortButton();
})();

// on submission of form store contact
var form = getElementById('contact-form');
form.addEventListener('submit', addNewContact);

/********** function to store contact on submission of form **********/
function addNewContact(e) {
  if(form.firstname.value == '' || form.lastname.value == '' || form.phone.value == '' || form.email.value == '') {
    var removeNotice = showNotice('You have an empty form field', 'yellow', 'black');
    setTimeout(removeNotice, 3300);
    e.preventDefault();
    return;
  }

  // generate a unique id to identify a particular contact by
  var id = new Date().getTime();

  // create new contact
  var contact = {
    firstname :  form.firstname.value,
    lastname  :  form.lastname.value,
    phone     :  form.phone.value,
    email     :  form.email.value,
    id        :  id
  }

  // capitalize name initials (a little sanitation)
  contact.firstname = contact.firstname[0].toUpperCase() + contact.firstname.slice(1).toLowerCase();
  contact.lastname = contact.lastname[0].toUpperCase() + contact.lastname.slice(1).toLowerCase();

  // add contact to DOM
  displayContact(contact);

  // add contact to local storage
  var contacts = getStoredContacts();
  contacts.push(contact);
  localStorage.contacts = JSON.stringify(contacts);

  // signal that contact has been added
  var removeNotice = showNotice('Contact has been added!', 'blue', 'black');
  setTimeout(removeNotice, 3300);

  displaySortButton();
  e.preventDefault();
}

/******************** function to delete contact ********************/
function deleteContact(id) {
  var list = getElementById('contact-list');

  // delete from DOM
  var item = getElementById(id);
  list.removeChild(item);

  // delete form local storage
  var contacts = getStoredContacts();
  var index = 0; // this variable is to get the position of the paricular contact to be deleted from the array
  contacts.forEach(function(contact) {
    if( id == contact.id) {
      contacts.splice(index, 1);
    }
    index++;
  });

  // update local storage
  localStorage.contacts = JSON.stringify(contacts);

  // signal that contact has been deleted
  var removeNotice = showNotice('Contact has been deleted!', 'red', 'white');
  setTimeout(removeNotice, 3300);

  displaySortButton();
}

/*********** function to edit previously stored contact ***********/
function editContact(id) { // editing is actually done in edit.js
  // store id, to be retrieved in edit.js on edit.html
  localStorage.idOfContactBeingEdited = JSON.stringify(id);
}

/************ function to show all details of a contact ************/
function showFullDetails(id) {
  var item = getElementById(id); // get list item
  var fullDetails = item.getElementsByClassName('full-details')[0]; // get details section

  if(fullDetails != undefined) {
    if(fullDetails.style.display == 'none') {
      fullDetails.style.display = 'block';
      item.title = "click to hide details";
    }
    else {
      fullDetails.style.display = 'none';
      item.title = "click to show details";
    }
  }
}

/***************************************************************************/
/************************* MISCELLANEOUS FUNCTIONS *************************/
/***************************************************************************/

/********* function to enable re-ordering feature (sorting) *********/
var sort = getElementById('sort');
sort.addEventListener('click', function () {
  var contacts = getStoredContacts();

  // get firstname initials, remove duplicates to avoid abnormal behaviour and sort
  var contactInitials = contacts.map(function(contact) {
    return contact.firstname[0]
  });

  contactInitials = contactInitials.filter(function(contactInitial, index) {
    if(contactInitials.indexOf(contactInitial) === index) {
      return contactInitial.toLowerCase();
    }
  });

  if(sort.value == 'ASC') {
    contactInitials.sort().reverse();
    sort.value = 'DESC';
  }
  else {
    contactInitials.sort();
    sort.value = 'ASC';
  }

  // clear DOM
  clearItemsFromDOM();

  // display re-ordered items
  contactInitials.forEach(function (contactInitial) {
    contacts.forEach(function (contact) {
      if(contact.firstname[0] == contactInitial){
        displayContact(contact);
        // console.log(contact);
      }
    });
  });
});

//
/******* display sort button if we have contacts to be sorted *******/
function displaySortButton() {
  if(getStoredContacts().length > 0 || getElementById('contact') != null) {
    getElementById('sort').style.display = 'block';
  }
  else {
    getElementById('sort').style.display = 'none';
  }
};

/******* function to display (toggle) confirmation message *******/
function showNotice(msg, backgroundColor, textColor) {
  var updateBox = getElementById('confirmation-box');
  updateBox.style.backgroundColor = backgroundColor;
  updateBox.style.color = textColor;
  getElementById('confirmation-msg').innerHTML = msg;

  // toggle display message
  var terminate = setInterval(function() {
    updateBox.style.display = (updateBox.style.display == 'none') ? 'block': 'none';
  }, 300);

  // clear display always
  updateBox.style.display = '';

  return function () {
    clearInterval(terminate);
  }
}

// randomly return a color
function color() {
  var colors = ['red', 'indigo', 'blue', 'green', 'darkgreen', 'maroon',
                'brown', 'tomato', 'darkblue', 'violet', 'orange', 'pink'
              ];
  return colors[Math.floor(Math.random() * 8)];
}

/******* this happens only when a contact is updated in edit.js *******/
if(JSON.parse(localStorage.idOfContactBeingEdited) == 'updated') {
  localStorage.idOfContactBeingEdited = JSON.stringify(0); // clear id
  var removeNotice = showNotice('Contact has been updated!', 'darkgreen', 'white');
  setTimeout(removeNotice, 3300); // just testing closure, so cool since i learnt it :smiles
}


/********************************************************************/
/************************* HELPER FUNCTIONS *************************/
/********************************************************************/

// function to retrieve all stored contacts from local storage; this is an array
function getStoredContacts() {
  return JSON.parse(localStorage.contacts);
}

function getElementById(id) {
  return document.getElementById(id);
}

// function to add a single contact to the DOM
function displayContact(contact) {
  var list = getElementById('contact-list');

  if(contact.id != undefined){
    var listItem = '<li id="'+ contact.id +'" class="contact" onclick="showFullDetails('+ contact.id +')" title="click to show details">\
                      <span class="contact-name">' + contact.firstname + ' ' + contact.lastname + '</span>\
                      <span class="modify">\
                        <a class="edit" href="edit.html" onclick="editContact('+ contact.id +')" title="click to edit contact details">edit</a>|'
                        +'<button class="delete" title="click to delete contact" onclick="deleteContact('+ contact.id +')">&times</button>\
                      </span>\
                      <div class="full-details" style="display:none;">\
                        <div class="avatar" style="background-color:'+ color() +'"><p>'+ contact.firstname[0] + ''+ contact.lastname[0] +'</p></div>\
                        <div><strong>Firstname: '+ contact.firstname +'</strong></div>\
                        <div><strong>Lastname: '+ contact.lastname +'</strong></div>\
                        <div><strong>Phone: '+ contact.phone +'</strong></div>\
                        <div><strong>Email: '+ contact.email +'</strong></div>\
                      </div>\
                    </li>';


    list.innerHTML = listItem + list.innerHTML; // ...for newly added items to appear at the top
  }
}

function clearItemsFromDOM() {
  var list = getElementById('contact-list').innerHTML = '';
}
