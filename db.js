let db;
let BudgetVersion;

const request = indexedDB.open('BudgetDB', BudgetVersion || 1);

request.onsuccess = event => {
    console.log(request.result);

    db = event.target.result
  };

request.onupgradeneeded = (event) => {
    console.log('Upgrade needed in IndexDB');

    const { oldVersion } = event;
    const newVersion = event.newVersion || db.version;

    console.log(`DB Updated from version ${oldVersion} to ${newVersion}`);

    db = event.target.result;

    if (db.objectStoreNames.length === 0) {
        db.createObjectStore('BudgetStore', { autoIncrement: true });
      }
  };

  request.onerror = function (event) {
    console.log(`Woops! ${event.target.errorCode}`);
  };

  function checkDatabase() {
    console.log('check db invoked');

    let workout = db.workout(["BudgetStore"], "readwrite")
    
    const store = db.workout.objectStore("BudgetStore")

    const getAll = store.getAll();

    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch("/api/transaction", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                  },
            })
            .then((response) => response.json())
            .then((res) => {
        
              if (res.length !== 0) {
 
                workout = db.workout(['BudgetStore'], 'readwrite');
    
                const currentStore = workout.objectStore('BudgetStore');
    
                currentStore.clear();
                console.log('Clearing store 🧹');
              }
            });
        }
    }
  }

  request.onsuccess = function (event) {
    console.log('success');
    db = event.target.result;
  
    // Check if app is online before reading from db
    if (navigator.onLine) {
      console.log('Backend online! 🗄️');
      checkDatabase();
    }
  };
  
  const saveRecord = (record) => {
    console.log('Save record invoked');
    // Create a transaction on the BudgetStore db with readwrite access
    const workout = db.workout(['BudgetStore'], 'readwrite');
  
    // Access your BudgetStore object store
    const store = workout.objectStore('BudgetStore');
  
    // Add record to your store with add method.
    store.add(record);
  };
  
  // Listen for app coming back online
  window.addEventListener('online', checkDatabase);
  