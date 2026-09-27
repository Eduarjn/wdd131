// SIP Sizer - the codec table.
//
// Every voice codec turns a conversation into a stream of small packets. The
// payload rate is the audio itself; the packets per second decide how often a
// 40 byte IP, UDP and RTP header rides along with it. That header is why a
// G.729 call costs 24 kbps on the wire and not the 8 kbps the codec advertises.

const IP_UDP_RTP_HEADER_BYTES = 40;

const CODECS = [
  {
    id: 'g711',
    name: 'G.711',
    standard: 'ITU-T G.711 PCM',
    payloadKbps: 64,
    packetsPerSecond: 50,
    mos: 4.4,
    royaltyFree: true,
    bestFor: 'Anything on a managed network with bandwidth to spare. The default for a reason: no compression, so nothing to go wrong.',
    watchOut: 'Eats bandwidth. Thirty concurrent calls is 4.8 Mbps in each direction.'
  },
  {
    id: 'g722',
    name: 'G.722',
    standard: 'ITU-T G.722 wideband',
    payloadKbps: 64,
    packetsPerSecond: 50,
    mos: 4.5,
    royaltyFree: true,
    bestFor: 'HD voice between desk phones inside one company. Doubles the audio range, so voices sound like the person instead of a telephone.',
    watchOut: 'The wideband quality survives only if both ends support it. A call out to the public network drops back to narrowband.'
  },
  {
    id: 'g726',
    name: 'G.726',
    standard: 'ITU-T G.726 ADPCM',
    payloadKbps: 32,
    packetsPerSecond: 50,
    mos: 3.8,
    royaltyFree: true,
    bestFor: 'Halving G.711 bandwidth without a licence fee or much processing.',
    watchOut: 'Audible quality loss when a call is transcoded more than once along the path.'
  },
  {
    id: 'opus',
    name: 'Opus',
    standard: 'IETF RFC 6716',
    payloadKbps: 24,
    packetsPerSecond: 50,
    mos: 4.3,
    royaltyFree: true,
    bestFor: 'WebRTC and softphones. It changes its own bitrate as the network changes, so quality degrades gracefully instead of breaking.',
    watchOut: 'Older desk phones and many carriers still do not support it, which forces a transcode at the edge.'
  },
  {
    id: 'ilbc',
    name: 'iLBC',
    standard: 'IETF RFC 3951',
    payloadKbps: 15.2,
    packetsPerSecond: 50,
    mos: 3.9,
    royaltyFree: true,
    bestFor: 'Networks that lose packets. Each frame stands alone, so a lost packet costs you one frame instead of garbling what follows.',
    watchOut: 'Less widely supported than G.729 despite being free to use.'
  },
  {
    id: 'g729',
    name: 'G.729',
    standard: 'ITU-T G.729 CS-ACELP',
    payloadKbps: 8,
    packetsPerSecond: 50,
    mos: 3.9,
    royaltyFree: false,
    bestFor: 'Squeezing the most calls through a thin or expensive link. Still the standard answer for branch offices on low bandwidth.',
    watchOut: 'Compresses hard, so music on hold and fax sound bad. Historically licensed, and some equipment still charges per channel.'
  }
];

// Bytes of audio in one packet, then the header, then back to bits per second.
function bandwidthPerCallKbps(codec) {
  const payloadBytesPerPacket = (codec.payloadKbps * 1000) / 8 / codec.packetsPerSecond;
  const bytesOnWire = payloadBytesPerPacket + IP_UDP_RTP_HEADER_BYTES;

  return (bytesOnWire * 8 * codec.packetsPerSecond) / 1000;
}

function findCodec(id) {
  return CODECS.find((codec) => codec.id === id);
}
