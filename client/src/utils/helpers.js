export function pluralize(name, count) {
  if (count === 1) {
    return name;
  }
  return name + "s";
}
//setting up indexedDB so that we can have our shopping cart persist across sessions or while offline.
//this is completed and just needs to be integrated into our React Components.
//this is just one function of a PWA but its actually so cool!!!!!
export function idbPromise(storeName, method, object) {
  return new Promise((resolve, reject) => {
    //open connection to the database `shop-shop` with the version of 1
    const request = window.indexedDB.open("shop-shop", 1);

    //create variables to hold references to the db, transaction (tx), and object store (store)
    let db, tx, store;

    //if version has changed(or if this is the first tiem using the db), run this method and create the three object stores
    request.onupgradeneeded = function (e) {
      const db = request.result;
      //create object store for each type of data and set 'primary' key inded to be the `_id` of the data
      db.createObjectStore("products", { keyPath: "_id" });
      db.createObjectStore("cart", { keyPath: "_id" });
      db.createObjectStore("categories", { keyPath: "_id" });
    };

    //handle any erros with connecting
    request.onerror = function (e) {
      console.log("error", e);
    };

    // on database open success, run this method
    request.onsuccess = function (e) {
      // save a reference of the database to the `db` variable
      db = request.result;
      // open a transaction do whatever we pass into `storeName` (must match one of the object store names)
      tx = db.transaction(storeName, "readwrite");
      // save a reference to that object store
      store = tx.objectStore(storeName);

      // if there's any errors, let us know
      db.onerror = function (e) {
        console.log("error", e);
      };
      // switch statement to check what the value of `method` is.
      //if its put, then run the .put() method on the object store, overwriting any data with the matching _id value and adding it if it can't find a match.
      //if its get, we'll simply get all data from that store and return it.
      //Both the put and get methods will return the data to wherever we call this idbPromise() function.
      //if its delete, we'll delete that item from the object store. This option comes handy if users want to remove an item from the shopping cart while offline.
      switch (method) {
        case "put":
          store.put(object);
          resolve(object);
          break;
        case "get":
          const all = store.getAll();
          all.onsuccess = function () {
            resolve(all.result);
          };
          break;
        case "delete":
          store.delete(object._id);
          break;
        default:
          console.log("No valid method");
          break;
      }

      // when the transaction is complete, close the connection
      tx.oncomplete = function () {
        db.close();
      };
    };
  });
}
