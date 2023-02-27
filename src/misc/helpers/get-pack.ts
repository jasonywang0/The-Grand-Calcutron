export default function getPack(Id: string, host:string = 'cubecobra.com') {
  return `https://${host}/cube/samplepackimage/${Id}/${Math.floor(Math.random() * 999999)}.png`;
}