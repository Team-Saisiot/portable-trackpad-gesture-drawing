export default (setIp) =>
  new Promise((resolve, reject) => {
    window.RTCPeerConnection =
      window.RTCPeerConnection ||
      window.mozRTCPeerConnection ||
      window.webkitRTCPeerConnection;

    if (typeof window.RTCPeerConnection == "undefined")
      return reject("WebRTC not supported by browser");

    const pc = new RTCPeerConnection();
    const ips = [];

    pc.createDataChannel("");
    pc.createOffer()
      .then((offer) => pc.setLocalDescription(offer))
      .catch((err) => reject(err));
    pc.onicecandidate = (event) => {
      if (!event || !event.candidate) {
        if (ips.length == 0)
          return reject("WebRTC disabled or restricted by browser");

        return resolve(ips);
      }

      const parts = event.candidate.candidate.split(" ");
      const [base, componentId, protocol, priority, ip, port, , type, ...attr] =
        parts;

      if (!ips.some((e) => e == ip)) ips.push(ip);

      setIp(ip);
    };
  });
