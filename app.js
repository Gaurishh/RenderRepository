//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://9gaurish:XM9C2FsgsvbecKiC@cluster0.wyho0nd.mongodb.net/todolistDB", {useNewUrlParser: true});

const itemsSchema = {
  Name: String
}

const ItemModel = mongoose.model("Item", itemsSchema); //collection name, structure of the items in the collection.

const i1 = new ItemModel({
  Name: "Clean house"
});

const i2 = new ItemModel({
  Name: "Brush teeth"
});

const i3 = new ItemModel({
  Name: "Do Homework"
});

const defaultItems = [i1, i2, i3];

app.get("/", function(req, res) {

  // const day = date.getDate();

  ItemModel.find().then((foundItems, err) => {
    // console.log(res);
    // console.log(err);

    if(foundItems.length===0){
      ItemModel.insertMany(defaultItems).then(function(){
        console.log("Data inserted");  // Success
      }).catch(function(error){
        console.log(error);      // Failure
      });
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });

  // res.render("list", {listTitle: "Today", newListItems: defaultItems});

});

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const ListModel = mongoose.model("List", listSchema);

app.get("/:customListName", function(req, res){

  const customListName = _.capitalize(req.params.customListName);

  ListModel.findOne({name: customListName}).then(function(foundItems, err){

    res.render("list", {listTitle: foundItems.name, newListItems: foundItems.items});

  }).catch(function(){

    const list = new ListModel({
      name: customListName,
      items: defaultItems
    })

    list.save();

    res.redirect("/" + customListName);
  });

  // const list = ListModel({
  //   name: customListName,
  //   items: defaultItems
  // });

  // list.save();

})

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new ItemModel({
    Name: itemName
  });

  if(listName === "Today"){
    item.save();

    console.log("Item added");

    res.redirect("/");
  }
  else{
    ListModel.findOne({name: listName}).then(function(foundList, err){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    }).catch(function(){
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    })
  }
  
});

app.post("/delete", function(req, res){
  const checkedItemId = (req.body.checkbox)

  const listName = req.body.listName;

  if(listName === "Today"){
    ItemModel.findByIdAndRemove(checkedItemId).then(function(){
      console.log("Successfully deleted")
    });
  
    res.redirect("/");
  }else{
    ListModel.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}).then(function(){
      console.log("Delete successful")
    }); //({access the customList}, {delete from array});
    res.redirect("/" + listName);
  }
  

});

app.get("/work", function(req, res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
