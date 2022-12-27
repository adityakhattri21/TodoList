//jshint esversion:6
// Requiring npm modules
const express = require("express");
const bodyParser = require("body-parser");

const mongoose =require('mongoose');
const _ = require('lodash')
//creating instance of app
const app = express();
//setting up ejs
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
//connecting with mongoDB database
mongoose.connect("mongodb://localhost:27017/todolistDB");

//creating default list schema
const ItemSchema=new mongoose.Schema({
  name:String
})
//creating custom schema for the custom lists
const customSchema ={  //another way of declaring mongoose schema
  name: String,
  items: [ItemSchema] //embedding items as arrays in this schema
}

const Item = mongoose.model("Item",ItemSchema)

const List = mongoose.model("List",customSchema)


const first = new Item({
  name: "Welcome To Your ToDoList"
})
const second = new Item({
  name: "Hit + to Save new items"
})
const third=new Item({
  name:"<-- Hit this to delete item"
})

const defaultArray = [first,second,third]

app.get("/", function(req, res) {
Item.find({}, function(err,foundItems){
  if(foundItems.length===0){
    Item.insertMany(defaultArray,function(err){
      if(err)
      console.log(err)
      else
      console.log("Successfully saved data in DB.")
    })
    res.redirect("/")
  }
  else{
      res.render("list", {listTitle: "Today", newListItems:foundItems});
  }

})



});


app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);  // capitalize converts every string input in format... capital first word and rest lowercase words.

  List.findOne({name: customListName} , function(err,foundItem){
    if(!err){
      if(!foundItem){ // if we dont find the item then we create a new list else we just redirect
        //create the list
        const list = new List({
          name: customListName,
          items: defaultArray
        })

        list.save()
        res.redirect("/"+customListName)

      }
      else{
        res.render("list",{listTitle: foundItem.name , newListItems: foundItem.items})
      }
    }
  })


})

app.get("/about", function(req, res){
  res.render("about");
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName= req.body.list

  const item = new Item({
    name:itemName
  })

  if(listName === "Today"){//if list name is today then we are updating it to default list .
    item.save()
    res.redirect("/")
  }

  else{//here we are adding element to the custom list that we created .
    List.findOne({name: listName} , function(err,foundList){
      foundList.items.push(item) // here we are pushing the added element in the items array in the custom list
      foundList.save()
      res.redirect("/"+ listName)
    })

  }


});

app.post("/delete",function(req,res){
  const checkdedItem = req.body.checkbox
  const listName = req.body.listName

  if(listName === "Today")
  {
    Item.findByIdAndRemove(checkdedItem,function(err){
      if(err)
      console.log(err)
      else
      console.log("Deleted Successfully")
    })
    res.redirect("/")
  }
  else{
    //find one and update require three parameters condition , update statement and callback function
    List.findOneAndUpdate({name: listName},{$pull:{items: {_id:checkdedItem }}} , function(err,foundList){
      //here $pull is a function which deletes the element from an array.
      // in this we pass the field which we want to delete . So we pass items in it. Inside this we are passing the Id of the checked element.
      if(!err){
        res.redirect("/"+listName)
      }
    })
  }

  })




app.listen(3000, function() {
  console.log("Server started on port 3000");
});
