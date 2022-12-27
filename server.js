const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const port = process.env.PORT || 3000

const server = express();


server.set("view engine" , "ejs");
server.use(bodyParser.urlencoded({extended:true}));
server.use(express.static("public"));

// mongoose.connect("mongodb://127.0.0.1:27017/ListDB");
mongoose.connect("mongodb+srv://aditya:aditya112233@atlascluster.urim7w3.mongodb.net/?retryWrites=true&w=majority")

const ItemSchema = new mongoose.Schema({
  name:String
}) ;

const CustomSchema = new mongoose.Schema({
  name: String,
  item: [ItemSchema]
});

const Item = mongoose.model("Item",ItemSchema);

const List = mongoose.model("List",CustomSchema);

const first = new Item({
  name: "Welcome to your Todolist"
})

const second = new Item({
  name: "Press + to add item"
})

const third = new Item({
  name: "--> Press this to delete item"
})

defaultArray = [first ,second , third];

server.get("/",(req,res) =>{
  Item.find({} , (err,foundItem) =>{
    if(foundItem.length === 0){
      Item.insertMany(defaultArray , (err)=>{
        if(err)
        console.log(err);
      })
      res.redirect("/");
    }
    else{
      res.render("list" , {listTitle: "Today" , newListItems: foundItem});
    }
  })
});

server.get("/:customListName" , (req,res) =>{
  const listName = _.capitalize(req.params.customListName);
  List.findOne({name:listName} , (err,foundItem) =>{
    if(!err){
      if(!foundItem){
        const list = new List({
          name: listName,
          item: defaultArray
        })

        list.save();
        console.log("/"+listName)
        res.redirect("/"+listName);

      }
      else{
        res.render("list" ,{listTitle:foundItem.name , newListItems: foundItem.item})
      }
    }
  })
});

server.get("/about" ,(req,res)=>{
  res.render("about");
})

server.post("/" ,(req,res)=>{

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name : itemName
  })

  if(listName === "Today"){
    item.save();
    res.redirect("/")
  }
  else{
    List.findOne({name: listName} , (err,foundList)=>{
      foundList.item.push(item)
      foundList.save()
      res.redirect("/"+listName)
    })
  }
});

server.post("/delete" , (req,res) =>{
  const listName = req.body.listName;
  const checkedItem = req.body.checkbox;

  if(listName === "Today"){
    Item.findByIdAndDelete(checkedItem , (err)=>{
      if(err)
      console.log(err);
    })
    res.redirect("/")
  }

  else{
    List.findOneAndUpdate({name:listName} , {$pull:{item: {_id: checkedItem}}} , (err,foundItem) =>{
      if(!err)
      res.redirect("/"+listName);
    })
  }
})


server.listen(port , ()=> {
  console.log(`Server started at port ${port}`);
})
