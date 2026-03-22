export default function normalizeIgredientName(name: string){
    name = name.toLowerCase().trim();
    let firstLetter = name.slice(0,1).toUpperCase();
    name = name.replace(firstLetter.toLowerCase(),firstLetter)
    console.log(name);
    return name
}