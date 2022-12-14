const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});

function init() {
  const channel = new Date().getTime()
  const flow_url = params.flow_url || "https://hooks.mediaflows.cloudinary.com/v1/Vevq2pbWgr4UYqaHqj8I";
  initPubnub(channel,flow_url)
}

let progress = 0;
let totalAssets = 0;
let totalSteps  = 0;
let currentStep = 0;
function step() {
var elem = document.getElementById("myBar");
width = 30;
elem.style.width = width + "%";
}

function initPubnub(channel, flow_url) {
  console.log(channel,flow_url)
  // Update this block with your publish/subscribe keys
  pubnub = new PubNub({
    subscribeKey: "sub-c-71bd4496-d80d-11eb-9c5c-16be9712fca8",
    uuid: "myUniqueUUID"
  })

  pubnub.addListener({
    status: function (statusEvent) {
      if (statusEvent.category === "PNConnectedCategory") {
        console.log("Connected.")
        postAssetsToMediaFlows(flow_url,channel) 
      }
    },
    message: function (msg) {
      console.log(msg.message);

      if (msg?.message?.output?.type && msg.message.output.type ==="progress"){
          totalSteps = msg.message.output.total_steps;
          console.log(totalSteps)
          currentStep++;
          let progress = (currentStep/totalSteps) * 100
          console.log(progress)
          var elem = document.getElementById("myBar");
          width = progress;
          elem.style.width = width + "%";      
          
      }
      
            if (msg.message.id === "mf_q3Hnx4rABwj4fiKz2UY2") {
                  console.log("r")
                    const payload = msg.message.output;
                    var gallery = document.getElementById("g");
              
                    var img = document.getElementById(payload.public_id);
                     
                    if (img) {
                        img.src = payload.secure_url
                        document.getElementById(payload.public_id+"_spinner").style.display = 'none';
                  
                    }
          } else {
              console.log("n")
          }
  }
  })
  console.log("Subscribing...");

  pubnub.subscribe({
    channels: [channel]
  });
};

function postAssetsToMediaFlows(flow_url,channel) {
           window.cloudinary.customAction.getConfig().then(data => {
              const { assets, cloudName } = data;
             //set the numebr of assets
              totalAssets = assets.length
              console.log(assets,cloudName,totalAssets)
             for (asset of assets) {
                  console.log(asset)
                  post(flow_url,channel,asset)
            }
            
          });
}

function post(flow_url,channel,paylod) {
        fetch(`${flow_url}?mf_publish_channel=${channel}`, {
        method: 'POST', // or 'PUT'
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paylod)
      })
      .then(response => response.json())
      .then(data => {
        //console.log('Success:', data);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
}
