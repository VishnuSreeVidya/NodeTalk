import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const EMOJI_CATEGORIES = [
  {
    id: 'recent',
    name: 'Frequently Used',
    icon: '🕒',
  },
  {
    id: 'smileys',
    name: 'Smileys & Emotion',
    icon: '😀',
    emojis: [
      { char: '😀', name: 'grinning face', tags: ['smile', 'happy'] },
      { char: '😃', name: 'grinning face with big eyes', tags: ['smile', 'happy', 'joy'] },
      { char: '😄', name: 'grinning face with smiling eyes', tags: ['smile', 'happy', 'laugh'] },
      { char: '😁', name: 'beaming face with smiling eyes', tags: ['smile', 'grin'] },
      { char: '😆', name: 'grinning squinting face', tags: ['laugh', 'lol'] },
      { char: '😅', name: 'grinning face with sweat', tags: ['sweat', 'relief', 'smile'] },
      { char: '🤣', name: 'rolling on the floor laughing', tags: ['rofl', 'lol', 'laugh'] },
      { char: '😂', name: 'face with tears of joy', tags: ['joy', 'tears', 'laugh', 'lol'] },
      { char: '🙂', name: 'slightly smiling face', tags: ['smile'] },
      { char: '🙃', name: 'upside-down face', tags: ['silly', 'sarcasm'] },
      { char: '😉', name: 'winking face', tags: ['wink', 'flirt'] },
      { char: '😊', name: 'smiling face with smiling eyes', tags: ['blush', 'smile'] },
      { char: '😇', name: 'smiling face with halo', tags: ['angel', 'innocent'] },
      { char: '🥰', name: 'smiling face with hearts', tags: ['love', 'crush', 'hearts'] },
      { char: '😍', name: 'smiling face with heart-eyes', tags: ['love', 'heart', 'adore'] },
      { char: '🤩', name: 'star-struck', tags: ['star', 'eyes', 'wow'] },
      { char: '😘', name: 'face blowing a kiss', tags: ['kiss', 'love', 'flirt'] },
      { char: '😗', name: 'kissing face', tags: ['kiss'] },
      { char: '☺️', name: 'smiling face', tags: ['blush', 'smile'] },
      { char: '😚', name: 'kissing face with closed eyes', tags: ['kiss'] },
      { char: '😙', name: 'kissing face with smiling eyes', tags: ['kiss'] },
      { char: '😋', name: 'face savoring food', tags: ['yum', 'delicious', 'tongue'] },
      { char: '😛', name: 'face with tongue', tags: ['tongue', 'silly'] },
      { char: '😜', name: 'winking face with tongue', tags: ['tongue', 'wink', 'silly'] },
      { char: '🤪', name: 'zany face', tags: ['crazy', 'silly'] },
      { char: '😝', name: 'squinting face with tongue', tags: ['tongue', 'silly'] },
      { char: '🤑', name: 'money-mouth face', tags: ['money', 'rich', 'cash'] },
      { char: '🤗', name: 'hugging face', tags: ['hug', 'warm'] },
      { char: '🤭', name: 'face with hand over mouth', tags: ['oops', 'gasp'] },
      { char: '🤫', name: 'shushing face', tags: ['quiet', 'secret', 'hush'] },
      { char: '🤔', name: 'thinking face', tags: ['think', 'ponder', 'wonder'] },
      { char: '🤐', name: 'zipper-mouth face', tags: ['mute', 'secret'] },
      { char: '🤨', name: 'face with raised eyebrow', tags: ['skeptical', 'suspicious'] },
      { char: '😐', name: 'neutral face', tags: ['pokerface', 'meh'] },
      { char: '😑', name: 'expressionless face', tags: ['meh', 'bored'] },
      { char: '😶', name: 'face without mouth', tags: ['blank', 'speechless'] },
      { char: '😏', name: 'smirking face', tags: ['smirk', 'flirt', 'sly'] },
      { char: '😒', name: 'unamused face', tags: ['annoyed', 'meh'] },
      { char: '🙄', name: 'face with rolling eyes', tags: ['eye-roll', 'whatever'] },
      { char: '😬', name: 'grimacing face', tags: ['awkward', 'nervous'] },
      { char: '🤥', name: 'lying face', tags: ['liar', 'pinocchio'] },
      { char: '😌', name: 'relieved face', tags: ['peaceful', 'calm'] },
      { char: '😔', name: 'pensive face', tags: ['sad', 'thoughtful'] },
      { char: '😪', name: 'sleepy face', tags: ['tired', 'sleep'] },
      { char: '🤤', name: 'drooling face', tags: ['drool', 'yummy'] },
      { char: '😴', name: 'sleeping face', tags: ['zzz', 'sleep', 'night'] },
      { char: '😷', name: 'face with medical mask', tags: ['sick', 'mask', 'covid'] },
      { char: '🤒', name: 'face with thermometer', tags: ['sick', 'fever'] },
      { char: '🤕', name: 'face with head-bandage', tags: ['hurt', 'injury'] },
      { char: '🤢', name: 'nauseated face', tags: ['gross', 'sick', 'disgust'] },
      { char: '🤮', name: 'face vomiting', tags: ['vomit', 'sick', 'barf'] },
      { char: '🤧', name: 'sneezing face', tags: ['sneeze', 'sick', 'achoo'] },
      { char: '🥵', name: 'hot face', tags: ['hot', 'heat', 'sweating'] },
      { char: '🥶', name: 'cold face', tags: ['cold', 'freezing', 'ice'] },
      { char: '🥴', name: 'woozy face', tags: ['dizzy', 'drunk'] },
      { char: '😵', name: 'dizzy face', tags: ['knocked out', 'dizzy'] },
      { char: '🤯', name: 'exploding head', tags: ['mindblown', 'shock'] },
      { char: '🤠', name: 'cowboy hat face', tags: ['cowboy', 'hat'] },
      { char: '🥳', name: 'partying face', tags: ['party', 'celebrate', 'birthday'] },
      { char: '😎', name: 'smiling face with sunglasses', tags: ['cool', 'sunglasses'] },
      { char: '🤓', name: 'nerd face', tags: ['nerd', 'geek', 'glasses'] },
      { char: '🧐', name: 'face with monocle', tags: ['monocle', 'curious'] },
      { char: '😕', name: 'confused face', tags: ['confused', 'huh'] },
      { char: '😟', name: 'worried face', tags: ['worried', 'nervous'] },
      { char: '🙁', name: 'slightly frowning face', tags: ['sad'] },
      { char: '😮', name: 'face with open mouth', tags: ['surprise', 'wow'] },
      { char: '😯', name: 'hushed face', tags: ['surprised', 'silent'] },
      { char: '😲', name: 'astonished face', tags: ['shocked', 'gasp'] },
      { char: '😳', name: 'flushed face', tags: ['blush', 'embarrassed'] },
      { char: '🥺', name: 'pleading face', tags: ['puppy eyes', 'please', 'beg'] },
      { char: '😦', name: 'frowning face with open mouth', tags: ['gasp', 'sad'] },
      { char: '😧', name: 'anguished face', tags: ['stunned'] },
      { char: '😨', name: 'fearful face', tags: ['scared', 'fear'] },
      { char: '😰', name: 'anxious face with sweat', tags: ['nervous', 'sweat'] },
      { char: '😥', name: 'sad but relieved face', tags: ['whew', 'phew'] },
      { char: '😢', name: 'crying face', tags: ['cry', 'sad', 'tear'] },
      { char: '😭', name: 'loudly crying face', tags: ['sob', 'cry', 'sad'] },
      { char: '😱', name: 'face screaming in fear', tags: ['scream', 'scared'] },
      { char: '😖', name: 'confounded face', tags: ['frustrated'] },
      { char: '😣', name: 'persevering face', tags: ['struggle'] },
      { char: '😞', name: 'disappointed face', tags: ['sad', 'disappointed'] },
      { char: '😓', name: 'downcast face with sweat', tags: ['hard work', 'sweat'] },
      { char: '😩', name: 'weary face', tags: ['tired', 'frustrated'] },
      { char: '😫', name: 'tired face', tags: ['exhausted', 'tired'] },
      { char: '🥱', name: 'yawning face', tags: ['yawn', 'sleepy'] },
      { char: '😤', name: 'face with steam from nose', tags: ['huff', 'triumph', 'angry'] },
      { char: '😡', name: 'enraged face', tags: ['angry', 'mad', 'rage'] },
      { char: '😠', name: 'angry face', tags: ['mad', 'annoyed'] },
      { char: '🤬', name: 'face with symbols on mouth', tags: ['curse', 'swearing', 'angry'] },
      { char: '😈', name: 'smiling face with horns', tags: ['devil', 'evil'] },
      { char: '👿', name: 'angry face with horns', tags: ['demon', 'devil'] },
      { char: '💀', name: 'skull', tags: ['dead', 'skeleton', 'death'] },
      { char: '💩', name: 'pile of poop', tags: ['poop', 'poo', 'crap'] },
      { char: '🤡', name: 'clown face', tags: ['clown', 'joke'] },
      { char: '👻', name: 'ghost', tags: ['halloween', 'spooky', 'ghost'] },
      { char: '👽', name: 'alien', tags: ['extraterrestrial', 'space'] },
      { char: '🤖', name: 'robot', tags: ['bot', 'tech'] },
      { char: '😺', name: 'grinning cat', tags: ['cat', 'smile'] },
      { char: '😸', name: 'grinning cat with smiling eyes', tags: ['cat', 'happy'] },
      { char: '😹', name: 'cat with tears of joy', tags: ['cat', 'lol'] },
      { char: '😻', name: 'smiling cat with heart-eyes', tags: ['cat', 'love'] },
      { char: '😼', name: 'cat with wry smile', tags: ['cat', 'smirk'] },
      { char: '😽', name: 'kissing cat', tags: ['cat', 'kiss'] },
      { char: '🙀', name: 'weary cat', tags: ['cat', 'shock'] },
      { char: '😿', name: 'crying cat', tags: ['cat', 'sad'] },
      { char: '😾', name: 'pouting cat', tags: ['cat', 'angry'] },
    ],
  },
  {
    id: 'people',
    name: 'People & Gestures',
    icon: '👋',
    emojis: [
      { char: '👋', name: 'waving hand', tags: ['wave', 'hello', 'bye'] },
      { char: '🤚', name: 'raised back of hand', tags: ['backhand'] },
      { char: '🖐️', name: 'hand with fingers splayed', tags: ['five', 'hand'] },
      { char: '✋', name: 'raised hand', tags: ['stop', 'highfive'] },
      { char: '🖖', name: 'vulcan salute', tags: ['spock', 'star trek'] },
      { char: '👌', name: 'OK hand', tags: ['ok', 'perfect'] },
      { char: '🤏', name: 'pinching hand', tags: ['tiny', 'small'] },
      { char: '✌️', name: 'victory hand', tags: ['peace', 'victory'] },
      { char: '🤞', name: 'crossed fingers', tags: ['luck', 'hope'] },
      { char: '🤟', name: 'love-you gesture', tags: ['ily', 'love'] },
      { char: '🤘', name: 'sign of the horns', tags: ['rock', 'metal'] },
      { char: '🤙', name: 'call me hand', tags: ['call', 'shaka'] },
      { char: '👈', name: 'backhand index pointing left', tags: ['left', 'point'] },
      { char: '👉', name: 'backhand index pointing right', tags: ['right', 'point'] },
      { char: '👆', name: 'backhand index pointing up', tags: ['up', 'point'] },
      { char: '🖕', name: 'middle finger', tags: ['fuck', 'finger'] },
      { char: '👇', name: 'backhand index pointing down', tags: ['down', 'point'] },
      { char: '☝️', name: 'index pointing up', tags: ['one', 'up'] },
      { char: '👍', name: 'thumbs up', tags: ['like', 'yes', 'good', 'thumbsup'] },
      { char: '👎', name: 'thumbs down', tags: ['dislike', 'no', 'bad'] },
      { char: '✊', name: 'raised fist', tags: ['fist', 'power'] },
      { char: '👊', name: 'oncoming fist', tags: ['punch', 'fistbump'] },
      { char: '🤛', name: 'left-facing fist', tags: ['fistbump'] },
      { char: '🤜', name: 'right-facing fist', tags: ['fistbump'] },
      { char: '👏', name: 'clapping hands', tags: ['clap', 'applause', 'bravo'] },
      { char: '🙌', name: 'raising hands', tags: ['celebrate', 'praise', 'hooray'] },
      { char: '👐', name: 'open hands', tags: ['hug', 'open'] },
      { char: '🤲', name: 'palms up together', tags: ['pray', 'cupped'] },
      { char: '🤝', name: 'handshake', tags: ['deal', 'agreement', 'partner'] },
      { char: '🙏', name: 'folded hands', tags: ['pray', 'please', 'thanks', 'namaste'] },
      { char: '✍️', name: 'writing hand', tags: ['write', 'letter'] },
      { char: '💅', name: 'nail polish', tags: ['nails', 'sassy', 'slay'] },
      { char: '🤳', name: 'selfie', tags: ['camera', 'selfie'] },
      { char: '💪', name: 'flexed biceps', tags: ['strong', 'muscle', 'gym', 'power'] },
      { char: '🧠', name: 'brain', tags: ['smart', 'intellect'] },
      { char: '👀', name: 'eyes', tags: ['look', 'see', 'peek', 'spotted'] },
      { char: '👁️', name: 'eye', tags: ['look'] },
      { char: '👅', name: 'tongue', tags: ['taste', 'lick'] },
      { char: '👄', name: 'mouth', tags: ['lips', 'kiss'] },
      { char: '👶', name: 'baby', tags: ['child', 'infant'] },
      { char: '🧒', name: 'child', tags: ['kid'] },
      { char: '👦', name: 'boy', tags: ['kid', 'male'] },
      { char: '👧', name: 'girl', tags: ['kid', 'female'] },
      { char: '🧑', name: 'person', tags: ['human'] },
      { char: '👨', name: 'man', tags: ['male', 'adult'] },
      { char: '👩', name: 'woman', tags: ['female', 'adult'] },
      { char: '🧔', name: 'bearded person', tags: ['beard'] },
      { char: '👵', name: 'old woman', tags: ['grandma', 'elder'] },
      { char: '👴', name: 'old man', tags: ['grandpa', 'elder'] },
      { char: '👲', name: 'man with skullcap', tags: ['hat'] },
      { char: '👮‍♂️', name: 'police officer', tags: ['cop', 'police'] },
      { char: '👷‍♀️', name: 'construction worker', tags: ['builder', 'helmet'] },
      { char: '💂‍♂️', name: 'guard', tags: ['british', 'security'] },
      { char: '🕵️‍♀️', name: 'detective', tags: ['spy', 'sleuth'] },
      { char: '👩‍⚕️', name: 'health worker', tags: ['doctor', 'nurse'] },
      { char: '👨‍🎓', name: 'student', tags: ['grad', 'college'] },
      { char: '👨‍🏫', name: 'teacher', tags: ['professor', 'school'] },
      { char: '👨‍⚖️', name: 'judge', tags: ['court', 'law'] },
      { char: '👨‍🌾', name: 'farmer', tags: ['crops', 'nature'] },
      { char: '👨‍🍳', name: 'cook', tags: ['chef', 'kitchen'] },
      { char: '👨‍🔧', name: 'mechanic', tags: ['repair', 'tools'] },
      { char: '👨‍💼', name: 'office worker', tags: ['business', 'suit'] },
      { char: '👨‍🔬', name: 'scientist', tags: ['lab', 'chemistry'] },
      { char: '👨‍💻', name: 'technologist', tags: ['coder', 'developer', 'hacker', 'laptop'] },
      { char: '👨‍🎤', name: 'singer', tags: ['rockstar', 'music'] },
      { char: '👨‍🎨', name: 'artist', tags: ['paint', 'art'] },
      { char: '👨‍✈️', name: 'pilot', tags: ['plane', 'flight'] },
      { char: '👨‍🚀', name: 'astronaut', tags: ['space', 'rocket'] },
      { char: '👨‍🚒', name: 'firefighter', tags: ['fire', 'hero'] },
      { char: '🤴', name: 'prince', tags: ['king', 'royal'] },
      { char: '👸', name: 'princess', tags: ['queen', 'crown', 'royal'] },
      { char: '💃', name: 'woman dancing', tags: ['dance', 'party'] },
      { char: '🕺', name: 'man dancing', tags: ['disco', 'dance'] },
      { char: '👯‍♀️', name: 'people with bunny ears', tags: ['party', 'friends'] },
      { char: '👫', name: 'man and woman holding hands', tags: ['couple', 'love'] },
      { char: '👬', name: 'two men holding hands', tags: ['couple', 'friends'] },
      { char: '👭', name: 'two women holding hands', tags: ['couple', 'sisters'] },
    ],
  },
  {
    id: 'animals',
    name: 'Animals & Nature',
    icon: '🐶',
    emojis: [
      { char: '🐶', name: 'dog face', tags: ['dog', 'puppy', 'pet'] },
      { char: '🐱', name: 'cat face', tags: ['cat', 'kitty', 'pet'] },
      { char: '🐭', name: 'mouse face', tags: ['mouse', 'rat'] },
      { char: '🐹', name: 'hamster', tags: ['pet', 'hamster'] },
      { char: '🐰', name: 'rabbit face', tags: ['bunny', 'rabbit'] },
      { char: '🦊', name: 'fox', tags: ['fox', 'clever'] },
      { char: '🐻', name: 'bear', tags: ['bear', 'teddy'] },
      { char: '🐼', name: 'panda', tags: ['panda', 'bamboo'] },
      { char: '🐨', name: 'koala', tags: ['koala', 'australia'] },
      { char: '🐯', name: 'tiger face', tags: ['tiger', 'wild'] },
      { char: '🦁', name: 'lion', tags: ['lion', 'king'] },
      { char: '🐮', name: 'cow face', tags: ['cow', 'farm'] },
      { char: '🐷', name: 'pig face', tags: ['pig', 'farm'] },
      { char: '🐸', name: 'frog', tags: ['frog', 'toad'] },
      { char: '🐵', name: 'monkey face', tags: ['monkey', 'ape'] },
      { char: '🙈', name: 'see-no-evil monkey', tags: ['monkey', 'blind'] },
      { char: '🙉', name: 'hear-no-evil monkey', tags: ['monkey', 'deaf'] },
      { char: '🙊', name: 'speak-no-evil monkey', tags: ['monkey', 'secret'] },
      { char: '🐔', name: 'chicken', tags: ['hen', 'rooster'] },
      { char: '🐧', name: 'penguin', tags: ['penguin', 'ice', 'bird'] },
      { char: '🐦', name: 'bird', tags: ['bird', 'fly'] },
      { char: '🐤', name: 'baby chick', tags: ['chick', 'cute'] },
      { char: '🦆', name: 'duck', tags: ['quack'] },
      { char: '🦅', name: 'eagle', tags: ['bird', 'freedom'] },
      { char: '🦉', name: 'owl', tags: ['wise', 'bird', 'night'] },
      { char: '🦇', name: 'bat', tags: ['vampire', 'batman'] },
      { char: '🐺', name: 'wolf', tags: ['wolf', 'wild'] },
      { char: '🐗', name: 'boar', tags: ['pig', 'wild'] },
      { char: '🐴', name: 'horse face', tags: ['horse', 'farm'] },
      { char: '🦄', name: 'unicorn', tags: ['magic', 'fantasy'] },
      { char: '🐝', name: 'honeybee', tags: ['bee', 'bug', 'honey'] },
      { char: '🐛', name: 'bug', tags: ['caterpillar', 'insect'] },
      { char: '🦋', name: 'butterfly', tags: ['beauty', 'insect'] },
      { char: '🐌', name: 'snail', tags: ['slow'] },
      { char: '🐞', name: 'lady beetle', tags: ['ladybug', 'luck'] },
      { char: '🐜', name: 'ant', tags: ['insect', 'worker'] },
      { char: '🕷️', name: 'spider', tags: ['scary', 'spooky'] },
      { char: '🦂', name: 'scorpion', tags: ['zodiac', 'poison'] },
      { char: '🐍', name: 'snake', tags: ['reptile', 'danger'] },
      { char: '🦎', name: 'lizard', tags: ['reptile'] },
      { char: '🦖', name: 't-rex', tags: ['dinosaur', 'dino'] },
      { char: '🐙', name: 'octopus', tags: ['sea', 'ocean'] },
      { char: '🦑', name: 'squid', tags: ['sea', 'food'] },
      { char: '🦐', name: 'shrimp', tags: ['seafood'] },
      { char: '🐠', name: 'tropical fish', tags: ['nemo', 'ocean'] },
      { char: '🐟', name: 'fish', tags: ['sea', 'swim'] },
      { char: '🐬', name: 'dolphin', tags: ['sea', 'ocean'] },
      { char: '🐳', name: 'spouting whale', tags: ['whale', 'ocean'] },
      { char: '🦈', name: 'shark', tags: ['jaws', 'danger'] },
      { char: '🐊', name: 'crocodile', tags: ['gator', 'alligator'] },
      { char: '🐅', name: 'tiger', tags: ['wild'] },
      { char: '🐆', name: 'leopard', tags: ['cheetah'] },
      { char: '🦓', name: 'zebra', tags: ['stripes'] },
      { char: '🦍', name: 'gorilla', tags: ['ape', 'strong'] },
      { char: '🐘', name: 'elephant', tags: ['trunk', 'big'] },
      { char: '🦏', name: 'rhinoceros', tags: ['rhino'] },
      { char: '🐪', name: 'camel', tags: ['desert'] },
      { char: '🦒', name: 'giraffe', tags: ['tall', 'safari'] },
      { char: '🐕', name: 'dog', tags: ['pet'] },
      { char: '🐈', name: 'cat', tags: ['pet'] },
      { char: '🦚', name: 'peacock', tags: ['feathers', 'bird'] },
      { char: '🦜', name: 'parrot', tags: ['bird', 'talk'] },
      { char: '🦩', name: 'flamingo', tags: ['pink', 'bird'] },
      { char: '🌲', name: 'evergreen tree', tags: ['tree', 'forest', 'christmas'] },
      { char: '🌳', name: 'deciduous tree', tags: ['tree', 'nature'] },
      { char: '🌴', name: 'palm tree', tags: ['beach', 'summer', 'tropical'] },
      { char: '🌵', name: 'cactus', tags: ['desert', 'prickly'] },
      { char: '🌾', name: 'sheaf of rice', tags: ['grain', 'nature'] },
      { char: '🌿', name: 'herb', tags: ['plant', 'leaf'] },
      { char: '☘️', name: 'shamrock', tags: ['clover', 'irish'] },
      { char: '🍀', name: 'four leaf clover', tags: ['luck', 'irish'] },
      { char: '🍁', name: 'maple leaf', tags: ['canada', 'fall', 'autumn'] },
      { char: '🍂', name: 'fallen leaf', tags: ['autumn', 'fall'] },
      { char: '🍃', name: 'leaf fluttering in wind', tags: ['nature', 'wind'] },
      { char: '🍄', name: 'mushroom', tags: ['mario', 'fungus'] },
      { char: '🌰', name: 'chestnut', tags: ['nut'] },
      { char: '🦀', name: 'crab', tags: ['seafood', 'beach'] },
      { char: '🌹', name: 'rose', tags: ['flower', 'love', 'red'] },
      { char: '🥀', name: 'wilted flower', tags: ['sad', 'dead'] },
      { char: '🌸', name: 'cherry blossom', tags: ['sakura', 'pink', 'spring'] },
      { char: '🌼', name: 'blossom', tags: ['flower', 'yellow'] },
      { char: '🌻', name: 'sunflower', tags: ['flower', 'sun', 'summer'] },
      { char: '🌞', name: 'sun with face', tags: ['sun', 'sunny', 'day'] },
      { char: '🌝', name: 'full moon face', tags: ['moon', 'night'] },
      { char: '⭐️', name: 'star', tags: ['star', 'favorite'] },
      { char: '🌟', name: 'glowing star', tags: ['sparkle', 'shine'] },
      { char: '✨', name: 'sparkles', tags: ['magic', 'clean', 'shiny', 'glitter'] },
      { char: '⚡️', name: 'high voltage', tags: ['zap', 'lightning', 'thunder', 'power'] },
      { char: '🔥', name: 'fire', tags: ['flame', 'hot', 'lit', 'trend'] },
      { char: '💥', name: 'collision', tags: ['boom', 'explode'] },
      { char: '☀️', name: 'sun', tags: ['sunny', 'weather'] },
      { char: '☁️', name: 'cloud', tags: ['weather', 'sky'] },
      { char: '🌧️', name: 'cloud with rain', tags: ['rain', 'weather'] },
      { char: '🌩️', name: 'cloud with lightning', tags: ['storm', 'thunder'] },
      { char: '❄️', name: 'snowflake', tags: ['cold', 'winter', 'snow'] },
      { char: '☃️', name: 'snowman', tags: ['frosty', 'winter'] },
      { char: '🌈', name: 'rainbow', tags: ['pride', 'color', 'sky'] },
      { char: '🌊', name: 'water wave', tags: ['ocean', 'sea', 'surf'] },
    ],
  },
  {
    id: 'food',
    name: 'Food & Drink',
    icon: '🍔',
    emojis: [
      { char: '🍏', name: 'green apple', tags: ['fruit', 'apple', 'healthy'] },
      { char: '🍎', name: 'red apple', tags: ['fruit', 'apple'] },
      { char: '🍐', name: 'pear', tags: ['fruit'] },
      { char: '🍊', name: 'tangerine', tags: ['orange', 'fruit'] },
      { char: '🍋', name: 'lemon', tags: ['sour', 'citrus'] },
      { char: '🍌', name: 'banana', tags: ['fruit', 'yellow'] },
      { char: '🍉', name: 'watermelon', tags: ['summer', 'fruit'] },
      { char: '🍇', name: 'grapes', tags: ['fruit', 'wine'] },
      { char: '🍓', name: 'strawberry', tags: ['fruit', 'berry'] },
      { char: '🍈', name: 'melon', tags: ['fruit'] },
      { char: '🍒', name: 'cherries', tags: ['fruit', 'cherry'] },
      { char: '🍑', name: 'peach', tags: ['fruit', 'butt'] },
      { char: '🥭', name: 'mango', tags: ['fruit', 'tropical'] },
      { char: '🍍', name: 'pineapple', tags: ['fruit', 'tropical'] },
      { char: '🥥', name: 'coconut', tags: ['tropical', 'nut'] },
      { char: '🍅', name: 'tomato', tags: ['vegetable'] },
      { char: '🥑', name: 'avocado', tags: ['guacamole', 'toast'] },
      { char: '🍆', name: 'eggplant', tags: ['aubergine'] },
      { char: '🥔', name: 'potato', tags: ['spud'] },
      { char: '🥕', name: 'carrot', tags: ['vegetable'] },
      { char: '🌽', name: 'ear of corn', tags: ['popcorn', 'maize'] },
      { char: '🌶️', name: 'hot pepper', tags: ['spicy', 'chili'] },
      { char: '🥒', name: 'cucumber', tags: ['pickle'] },
      { char: '🥦', name: 'broccoli', tags: ['veggie', 'green'] },
      { char: '🧄', name: 'garlic', tags: ['flavor', 'cooking'] },
      { char: '🧅', name: 'onion', tags: ['cooking'] },
      { char: '🍞', name: 'bread', tags: ['toast', 'bakery'] },
      { char: '🥐', name: 'croissant', tags: ['french', 'pastry'] },
      { char: '🥖', name: 'baguette bread', tags: ['french', 'bread'] },
      { char: '🥨', name: 'pretzel', tags: ['snack', 'german'] },
      { char: '🥯', name: 'bagel', tags: ['breakfast'] },
      { char: '🥞', name: 'pancakes', tags: ['breakfast', 'syrup'] },
      { char: '🧇', name: 'waffle', tags: ['breakfast'] },
      { char: '🧀', name: 'cheese wedge', tags: ['cheese'] },
      { char: '🍖', name: 'meat on bone', tags: ['meat', 'bbq'] },
      { char: '🍗', name: 'poultry leg', tags: ['chicken', 'drumstick'] },
      { char: '🥩', name: 'cut of meat', tags: ['steak', 'beef'] },
      { char: '🥓', name: 'bacon', tags: ['pork', 'breakfast'] },
      { char: '🍔', name: 'hamburger', tags: ['burger', 'fast food'] },
      { char: '🍟', name: 'french fries', tags: ['fries', 'fast food'] },
      { char: '🍕', name: 'pizza', tags: ['slice', 'cheese', 'italian'] },
      { char: '🌭', name: 'hot dog', tags: ['sausage', 'fast food'] },
      { char: '🥪', name: 'sandwich', tags: ['lunch'] },
      { char: '🌮', name: 'taco', tags: ['mexican', 'food'] },
      { char: '🌯', name: 'burrito', tags: ['mexican', 'wrap'] },
      { char: '🍳', name: 'cooking', tags: ['egg', 'breakfast'] },
      { char: '🥘', name: 'shallow pan of food', tags: ['paella'] },
      { char: '🍲', name: 'pot of food', tags: ['soup', 'stew'] },
      { char: '🥣', name: 'bowl with spoon', tags: ['cereal', 'soup'] },
      { char: '🥗', name: 'green salad', tags: ['healthy', 'salad'] },
      { char: '🍿', name: 'popcorn', tags: ['movie', 'snack'] },
      { char: '🧈', name: 'butter', tags: ['dairy'] },
      { char: '🧂', name: 'salt', tags: ['seasoning', 'salty'] },
      { char: '🍱', name: 'bento box', tags: ['japanese', 'lunch'] },
      { char: '🍙', name: 'rice ball', tags: ['onigiri', 'japanese'] },
      { char: '🍚', name: 'cooked rice', tags: ['bowl'] },
      { char: '🍛', name: 'curry rice', tags: ['indian', 'curry'] },
      { char: '🍜', name: 'steaming bowl', tags: ['ramen', 'noodes'] },
      { char: '🍝', name: 'spaghetti', tags: ['pasta', 'italian'] },
      { char: '🍣', name: 'sushi', tags: ['japanese', 'fish'] },
      { char: '🍤', name: 'fried shrimp', tags: ['tempura'] },
      { char: '🥟', name: 'dumpling', tags: ['gyoza', 'asian'] },
      { char: '🍦', name: 'soft ice cream', tags: ['dessert', 'sweet'] },
      { char: '🍨', name: 'ice cream', tags: ['dessert', 'cold'] },
      { char: '🍩', name: 'donut', tags: ['doughnut', 'sweet'] },
      { char: '🍪', name: 'cookie', tags: ['chocolate', 'snack'] },
      { char: '🎂', name: 'birthday cake', tags: ['cake', 'celebrate', 'birthday'] },
      { char: '🍰', name: 'shortcake', tags: ['dessert', 'cake'] },
      { char: '🧁', name: 'cupcake', tags: ['muffin', 'sweet'] },
      { char: '🥧', name: 'pie', tags: ['apple pie', 'baking'] },
      { char: '🍫', name: 'chocolate bar', tags: ['candy', 'sweet'] },
      { char: '🍬', name: 'candy', tags: ['sweet'] },
      { char: '🍭', name: 'lollipop', tags: ['candy', 'sugar'] },
      { char: '🍮', name: 'custard', tags: ['pudding', 'flan'] },
      { char: '🍯', name: 'honey pot', tags: ['sweet', 'bee'] },
      { char: '🥛', name: 'glass of milk', tags: ['dairy', 'drink'] },
      { char: '☕️', name: 'hot beverage', tags: ['coffee', 'tea', 'espresso'] },
      { char: '🍵', name: 'teacup without handle', tags: ['green tea', 'matcha'] },
      { char: '🍾', name: 'bottle with popping cork', tags: ['champagne', 'celebration'] },
      { char: '🍷', name: 'wine glass', tags: ['wine', 'alcohol', 'drink'] },
      { char: '🍸', name: 'cocktail glass', tags: ['martini', 'drink'] },
      { char: '🍹', name: 'tropical drink', tags: ['cocktail', 'summer'] },
      { char: '🍺', name: 'beer mug', tags: ['beer', 'pub', 'cheers'] },
      { char: '🍻', name: 'clinking beer mugs', tags: ['cheers', 'beers'] },
      { char: '🥂', name: 'clinking glasses', tags: ['toast', 'champagne'] },
      { char: '🥃', name: 'tumbler glass', tags: ['whiskey', 'bourbon'] },
      { char: '🥤', name: 'cup with straw', tags: ['soda', 'smoothie'] },
      { char: '🧊', name: 'ice', tags: ['cold', 'cube'] },
    ],
  },
  {
    id: 'sports',
    name: 'Activities & Sports',
    icon: '⚽',
    emojis: [
      { char: '⚽️', name: 'soccer ball', tags: ['football', 'sports'] },
      { char: '🏀', name: 'basketball', tags: ['hoops', 'sports'] },
      { char: '🏈', name: 'american football', tags: ['nfl', 'sports'] },
      { char: '⚾️', name: 'baseball', tags: ['sports'] },
      { char: '🥎', name: 'softball', tags: ['sports'] },
      { char: '🎾', name: 'tennis', tags: ['racket', 'sports'] },
      { char: '🏐', name: 'volleyball', tags: ['beach', 'sports'] },
      { char: '🏉', name: 'rugby football', tags: ['sports'] },
      { char: '🎱', name: 'pool 8 ball', tags: ['billiards', 'game'] },
      { char: '🏓', name: 'ping pong', tags: ['table tennis'] },
      { char: '🏸', name: 'badminton', tags: ['shuttlecock'] },
      { char: '🏒', name: 'ice hockey', tags: ['sports', 'puck'] },
      { char: '🏏', name: 'cricket game', tags: ['cricket', 'bat', 'ball', 'sports'] },
      { char: '⛳️', name: 'flag in hole', tags: ['golf'] },
      { char: '🏹', name: 'bow and arrow', tags: ['archery'] },
      { char: '🎣', name: 'fishing pole', tags: ['fish', 'catch'] },
      { char: '🥊', name: 'boxing glove', tags: ['fight', 'punch'] },
      { char: '🥋', name: 'martial arts uniform', tags: ['karate', 'judo'] },
      { char: '🛹', name: 'skateboard', tags: ['skate', 'board'] },
      { char: '🎿', name: 'skis', tags: ['skiing', 'snow'] },
      { char: '🏋️‍♂️', name: 'man lifting weights', tags: ['gym', 'workout', 'barbell'] },
      { char: '🤸‍♀️', name: 'woman cartwheeling', tags: ['gymnastics', 'flip'] },
      { char: '🧘‍♀️', name: 'woman in lotus position', tags: ['yoga', 'meditate'] },
      { char: '🏄‍♂️', name: 'man surfing', tags: ['surf', 'waves'] },
      { char: '🏊‍♂️', name: 'man swimming', tags: ['swim', 'pool'] },
      { char: '🚣‍♂️', name: 'man rowing boat', tags: ['rowing', 'boat'] },
      { char: '🧗‍♀️', name: 'woman climbing', tags: ['rock climbing', 'climb'] },
      { char: '🚴‍♂️', name: 'man biking', tags: ['bicycle', 'cycling'] },
      { char: '🎯', name: 'bullseye', tags: ['darts', 'target', 'goal'] },
      { char: '🎮', name: 'video game', tags: ['game', 'controller', 'playstation', 'xbox'] },
      { char: '🎰', name: 'slot machine', tags: ['casino', 'gamble'] },
      { char: '🎲', name: 'game die', tags: ['dice', 'luck'] },
      { char: '🧩', name: 'puzzle piece', tags: ['jigsaw', 'game'] },
      { char: '🎨', name: 'artist palette', tags: ['art', 'paint', 'design'] },
      { char: '🎭', name: 'performing arts', tags: ['theater', 'drama', 'masks'] },
      { char: '🎤', name: 'microphone', tags: ['sing', 'karaoke', 'music'] },
      { char: '🎧', name: 'headphone', tags: ['music', 'listen', 'audio'] },
      { char: '🎼', name: 'musical score', tags: ['notes', 'music'] },
      { char: '🎹', name: 'musical keyboard', tags: ['piano', 'music'] },
      { char: '🥁', name: 'drum', tags: ['music', 'beats'] },
      { char: '🎷', name: 'saxophone', tags: ['jazz', 'music'] },
      { char: '🎺', name: 'trumpet', tags: ['music', 'brass'] },
      { char: '🎸', name: 'guitar', tags: ['rock', 'music'] },
      { char: '🎻', name: 'violin', tags: ['classical', 'music'] },
      { char: '🎬', name: 'clapper board', tags: ['movie', 'film', 'cinema'] },
      { char: '🏆', name: 'trophy', tags: ['winner', 'first', 'award'] },
      { char: '🥇', name: '1st place medal', tags: ['gold', 'winner'] },
      { char: '🥈', name: '2nd place medal', tags: ['silver'] },
      { char: '🥉', name: '3rd place medal', tags: ['bronze'] },
      { char: '🏅', name: 'sports medal', tags: ['award'] },
    ],
  },
  {
    id: 'travel',
    name: 'Travel & Places',
    icon: '🚀',
    emojis: [
      { char: '🚗', name: 'automobile', tags: ['car', 'drive'] },
      { char: '🚕', name: 'taxi', tags: ['cab'] },
      { char: '🚙', name: 'sport utility vehicle', tags: ['suv', 'car'] },
      { char: '🚌', name: 'bus', tags: ['transit'] },
      { char: '🏎️', name: 'racing car', tags: ['f1', 'speed'] },
      { char: '🚓', name: 'police car', tags: ['cop', 'patrol'] },
      { char: '🚑', name: 'ambulance', tags: ['emergency', 'medical'] },
      { char: '🚒', name: 'fire engine', tags: ['fire truck'] },
      { char: '🚚', name: 'delivery truck', tags: ['shipping'] },
      { char: '🚜', name: 'tractor', tags: ['farm'] },
      { char: '🛴', name: 'kick scooter', tags: ['scooter'] },
      { char: '🚲', name: 'bicycle', tags: ['bike', 'cycling'] },
      { char: '🛵', name: 'motor scooter', tags: ['vespa'] },
      { char: '🏍️', name: 'motorcycle', tags: ['bike', 'speed'] },
      { char: '🚨', name: 'police car light', tags: ['siren', 'alert', 'warning'] },
      { char: '🚄', name: 'high-speed train', tags: ['bullet train', 'japan'] },
      { char: '🚅', name: 'bullet train', tags: ['speed', 'train'] },
      { char: '🚆', name: 'train', tags: ['railway'] },
      { char: '🚇', name: 'metro', tags: ['subway', 'underground'] },
      { char: '✈️', name: 'airplane', tags: ['flight', 'fly', 'travel', 'vacation'] },
      { char: '🛫', name: 'airplane departure', tags: ['takeoff', 'flight'] },
      { char: '🛬', name: 'airplane arrival', tags: ['landing', 'flight'] },
      { char: '🚀', name: 'rocket', tags: ['space', 'launch', 'moon', 'crypto'] },
      { char: '🛸', name: 'flying saucer', tags: ['ufo', 'alien'] },
      { char: '🚁', name: 'helicopter', tags: ['chopper'] },
      { char: '⛵️', name: 'sailboat', tags: ['boat', 'sea'] },
      { char: '🛥️', name: 'motor boat', tags: ['yacht'] },
      { char: '🚢', name: 'ship', tags: ['cruise', 'boat'] },
      { char: '⚓️', name: 'anchor', tags: ['ship', 'navy'] },
      { char: '⛽️', name: 'fuel pump', tags: ['gas', 'petrol'] },
      { char: '🗺️', name: 'world map', tags: ['travel', 'geography'] },
      { char: '🗿', name: 'moai', tags: ['easter island', 'stone'] },
      { char: '🗽', name: 'statue of liberty', tags: ['nyc', 'usa'] },
      { char: '🗼', name: 'tokyo tower', tags: ['japan', 'tower'] },
      { char: '🏰', name: 'castle', tags: ['disney', 'fairytale'] },
      { char: '🏯', name: 'japanese castle', tags: ['japan'] },
      { char: '🏟️', name: 'stadium', tags: ['arena', 'sports'] },
      { char: '🎡', name: 'ferris wheel', tags: ['carnival', 'park'] },
      { char: '🎢', name: 'roller coaster', tags: ['amusement park'] },
      { char: '💈', name: 'barber pole', tags: ['haircut'] },
      { char: '⛺️', name: 'tent', tags: ['camping', 'outdoors'] },
      { char: '🌅', name: 'sunrise', tags: ['morning', 'sun'] },
      { char: '🌄', name: 'sunrise over mountains', tags: ['nature'] },
      { char: '🏙️', name: 'cityscape', tags: ['city', 'buildings'] },
      { char: '🏞️', name: 'national park', tags: ['nature', 'mountains'] },
      { char: '🛺', name: 'auto rickshaw', tags: ['tuk tuk', 'india'] },
    ],
  },
  {
    id: 'objects',
    name: 'Objects & Technology',
    icon: '💡',
    emojis: [
      { char: '⌚️', name: 'watch', tags: ['time', 'clock', 'apple watch'] },
      { char: '📱', name: 'mobile phone', tags: ['smartphone', 'iphone', 'cell'] },
      { char: '📲', name: 'mobile phone with arrow', tags: ['call', 'text'] },
      { char: '💻', name: 'laptop', tags: ['computer', 'pc', 'macbook', 'work'] },
      { char: '⌨️', name: 'keyboard', tags: ['typing', 'tech'] },
      { char: '🖥️', name: 'desktop computer', tags: ['pc', 'monitor'] },
      { char: '🖨️', name: 'printer', tags: ['print', 'office'] },
      { char: '🖱️', name: 'computer mouse', tags: ['tech', 'click'] },
      { char: '💾', name: 'floppy disk', tags: ['save', 'disk', 'retro'] },
      { char: '💿', name: 'optical disk', tags: ['cd', 'dvd'] },
      { char: '📷', name: 'camera', tags: ['photo', 'picture', 'snap'] },
      { char: '📸', name: 'camera with flash', tags: ['photo', 'flash'] },
      { char: '📹', name: 'video camera', tags: ['video', 'record'] },
      { char: '🔍', name: 'magnifying glass tilted left', tags: ['search', 'find'] },
      { char: '🔎', name: 'magnifying glass tilted right', tags: ['search', 'zoom'] },
      { char: '🕯️', name: 'candle', tags: ['light', 'flame'] },
      { char: '💡', name: 'light bulb', tags: ['idea', 'light', 'bright'] },
      { char: '🔦', name: 'flashlight', tags: ['torch', 'light'] },
      { char: '📖', name: 'open book', tags: ['read', 'study', 'book'] },
      { char: '📚', name: 'books', tags: ['library', 'study', 'read', 'school'] },
      { char: '📝', name: 'memo', tags: ['note', 'write', 'paper'] },
      { char: '💰', name: 'money bag', tags: ['cash', 'rich', 'wealth'] },
      { char: '💵', name: 'dollar banknote', tags: ['cash', 'money', 'usd'] },
      { char: '💳', name: 'credit card', tags: ['pay', 'card', 'visa'] },
      { char: '✉️', name: 'envelope', tags: ['email', 'mail', 'letter'] },
      { char: '📧', name: 'e-mail', tags: ['email', 'mail'] },
      { char: '📦', name: 'package', tags: ['parcel', 'box', 'delivery'] },
      { char: '✏️', name: 'pencil', tags: ['draw', 'write', 'edit'] },
      { char: '📅', name: 'calendar', tags: ['date', 'schedule', 'event'] },
      { char: '📊', name: 'bar chart', tags: ['stats', 'analytics'] },
      { char: '📋', name: 'clipboard', tags: ['copy', 'paste', 'task'] },
      { char: '📌', name: 'pushpin', tags: ['pin', 'mark', 'location'] },
      { char: '📍', name: 'round pushpin', tags: ['pin', 'map'] },
      { char: '📎', name: 'paperclip', tags: ['attach', 'file'] },
      { char: '✂️', name: 'scissors', tags: ['cut', 'snip'] },
      { char: '🔒', name: 'locked', tags: ['security', 'password', 'padlock'] },
      { char: '🔓', name: 'unlocked', tags: ['open', 'padlock'] },
      { char: '🔑', name: 'key', tags: ['password', 'access', 'unlock'] },
      { char: '🔨', name: 'hammer', tags: ['tool', 'build'] },
      { char: '🛡️', name: 'shield', tags: ['protect', 'security', 'guard'] },
      { char: '⚙️', name: 'gear', tags: ['settings', 'config', 'cog'] },
      { char: '🔔', name: 'bell', tags: ['notification', 'ring', 'alert'] },
      { char: '🔕', name: 'bell with slash', tags: ['mute', 'silent'] },
      { char: '🧪', name: 'test tube', tags: ['science', 'chemistry'] },
      { char: '💉', name: 'syringe', tags: ['vaccine', 'shot', 'doctor'] },
      { char: '💊', name: 'pill', tags: ['medicine', 'drugs'] },
    ],
  },
  {
    id: 'symbols',
    name: 'Symbols & Flags',
    icon: '❤️',
    emojis: [
      { char: '❤️', name: 'red heart', tags: ['love', 'heart', 'like'] },
      { char: '🧡', name: 'orange heart', tags: ['love', 'heart'] },
      { char: '💛', name: 'yellow heart', tags: ['love', 'heart', 'gold'] },
      { char: '💚', name: 'green heart', tags: ['love', 'heart', 'nature'] },
      { char: '💙', name: 'blue heart', tags: ['love', 'heart', 'blue'] },
      { char: '💜', name: 'purple heart', tags: ['love', 'heart', 'bts'] },
      { char: '🖤', name: 'black heart', tags: ['love', 'heart', 'dark'] },
      { char: '🤍', name: 'white heart', tags: ['love', 'heart', 'pure'] },
      { char: '💔', name: 'broken heart', tags: ['breakup', 'sad', 'heartbreak'] },
      { char: '❣️', name: 'heart exclamation', tags: ['love'] },
      { char: '💕', name: 'two hearts', tags: ['love', 'hearts'] },
      { char: '💞', name: 'revolving hearts', tags: ['love'] },
      { char: '💓', name: 'beating heart', tags: ['heartbeat', 'love'] },
      { char: '💗', name: 'growing heart', tags: ['love'] },
      { char: '💖', name: 'sparkling heart', tags: ['love', 'sparkle'] },
      { char: '💘', name: 'heart with arrow', tags: ['cupid', 'love'] },
      { char: '💝', name: 'heart with ribbon', tags: ['gift', 'love'] },
      { char: '☮️', name: 'peace symbol', tags: ['peace'] },
      { char: '✝️', name: 'latin cross', tags: ['christian'] },
      { char: '☪️', name: 'star and crescent', tags: ['islam'] },
      { char: '🕉️', name: 'om', tags: ['hindu', 'yoga'] },
      { char: '☸️', name: 'wheel of dharma', tags: ['buddhism'] },
      { char: '✡️', name: 'star of david', tags: ['jewish'] },
      { char: '☯️', name: 'yin yang', tags: ['balance', 'taoism'] },
      { char: '♈️', name: 'aries', tags: ['zodiac'] },
      { char: '♉️', name: 'taurus', tags: ['zodiac'] },
      { char: '♊️', name: 'gemini', tags: ['zodiac'] },
      { char: '♋️', name: 'cancer', tags: ['zodiac'] },
      { char: '♌️', name: 'leo', tags: ['zodiac'] },
      { char: '♍️', name: 'virgo', tags: ['zodiac'] },
      { char: '♎️', name: 'libra', tags: ['zodiac'] },
      { char: '♏️', name: 'scorpio', tags: ['zodiac'] },
      { char: '♐️', name: 'sagittarius', tags: ['zodiac'] },
      { char: '♑️', name: 'capricorn', tags: ['zodiac'] },
      { char: '♒️', name: 'aquarius', tags: ['zodiac'] },
      { char: '♓️', name: 'pisces', tags: ['zodiac'] },
      { char: '⚛️', name: 'atom symbol', tags: ['science', 'physics'] },
      { char: '🆘', name: 'SOS button', tags: ['help', 'emergency'] },
      { char: '❌', name: 'cross mark', tags: ['no', 'x', 'wrong', 'delete'] },
      { char: '⭕️', name: 'hollow red circle', tags: ['circle', 'ok'] },
      { char: '🛑', name: 'stop sign', tags: ['stop', 'halt'] },
      { char: '⛔️', name: 'no entry', tags: ['forbidden', 'stop'] },
      { char: '🚫', name: 'prohibited', tags: ['no', 'ban', 'forbidden'] },
      { char: '💯', name: 'hundred points', tags: ['100', 'perfect', 'score', 'lit'] },
      { char: '💢', name: 'anger symbol', tags: ['mad', 'angry'] },
      { char: '❗️', name: 'red exclamation mark', tags: ['alert', 'warning', 'important'] },
      { char: '❓', name: 'red question mark', tags: ['ask', 'what', 'help'] },
      { char: '⚠️', name: 'warning', tags: ['caution', 'danger', 'alert'] },
      { char: '🏁', name: 'chequered flag', tags: ['race', 'finish', 'winner'] },
      { char: '🚩', name: 'triangular flag', tags: ['red flag', 'mark'] },
      { char: '🏳️‍🌈', name: 'rainbow flag', tags: ['pride', 'lgbt'] },
      { char: '🏴‍☠️', name: 'pirate flag', tags: ['skull', 'jolly roger'] },
      { char: '🇮🇳', name: 'flag India', tags: ['india', 'in', 'bharat'] },
      { char: '🇺🇸', name: 'flag United States', tags: ['usa', 'america'] },
      { char: '🇬🇧', name: 'flag United Kingdom', tags: ['uk', 'britain'] },
      { char: '🇨🇦', name: 'flag Canada', tags: ['canada', 'ca'] },
      { char: '🇦🇺', name: 'flag Australia', tags: ['australia', 'au'] },
      { char: '🇩🇪', name: 'flag Germany', tags: ['germany', 'de'] },
      { char: '🇫🇷', name: 'flag France', tags: ['france', 'fr'] },
      { char: '🇯🇵', name: 'flag Japan', tags: ['japan', 'jp'] },
      { char: '🇰🇷', name: 'flag South Korea', tags: ['korea', 'kr'] },
      { char: '🇨🇳', name: 'flag China', tags: ['china', 'cn'] },
      { char: '🇧🇷', name: 'flag Brazil', tags: ['brazil', 'br'] },
      { char: '🇪🇸', name: 'flag Spain', tags: ['spain', 'es'] },
      { char: '🇮🇹', name: 'flag Italy', tags: ['italy', 'it'] },
      { char: '🇲🇽', name: 'flag Mexico', tags: ['mexico', 'mx'] },
      { char: '🇦🇷', name: 'flag Argentina', tags: ['argentina', 'ar'] },
    ],
  },
]

const STORAGE_KEY_RECENT = 'nodetalk_recent_emojis'
const DEFAULT_RECENTS = ['😂', '❤️', '👍', '🔥', '😊', '🙌', '😍', '🎉', '💯', '✨']

export default function EmojiPicker({ onSelect, open, onClose }) {
  const ref = useRef(null)
  const gridContainerRef = useRef(null)
  const [activeTab, setActiveTab] = useState('smileys')
  const [search, setSearch] = useState('')
  const [recentEmojis, setRecentEmojis] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RECENT)
      return saved ? JSON.parse(saved) : DEFAULT_RECENTS
    } catch {
      return DEFAULT_RECENTS
    }
  })

  // Handle outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open, onClose])

  // Handle emoji selection & save to recent
  const handleEmojiClick = useCallback((char) => {
    onSelect(char)
    setRecentEmojis((prev) => {
      const updated = [char, ...prev.filter((e) => e !== char)].slice(0, 24)
      try {
        localStorage.setItem(STORAGE_KEY_RECENT, JSON.stringify(updated))
      } catch {
        // Silently catch storage errors
      }
      return updated
    })
  }, [onSelect])

  // Scroll to section when tab is clicked
  const handleTabClick = (catId) => {
    setActiveTab(catId)
    setSearch('')
    if (gridContainerRef.current) {
      const targetElement = gridContainerRef.current.querySelector(`#emoji-cat-${catId}`)
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }

  // Filtered emojis based on search term
  const searchResults = useMemo(() => {
    if (!search.trim()) return null
    const query = search.toLowerCase().trim()
    const results = []

    for (const cat of EMOJI_CATEGORIES) {
      if (!cat.emojis) continue
      for (const item of cat.emojis) {
        if (
          item.name.toLowerCase().includes(query) ||
          item.tags.some((t) => t.toLowerCase().includes(query)) ||
          item.char === query
        ) {
          if (!results.some((r) => r.char === item.char)) {
            results.push(item)
          }
        }
      }
    }
    return results
  }, [search])

  if (!open) return null

  return (
    <AnimatePresence>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="absolute bottom-full left-0 mb-3 z-50 flex flex-col w-[340px] h-[390px] rounded-2xl shadow-2xl overflow-hidden border"
        style={{
          background: 'var(--surface-elevated)',
          borderColor: 'var(--border-secondary)',
          boxShadow: 'var(--shadow-popover)',
        }}
      >
        {/* Search Bar */}
        <div className="p-2.5 border-b flex items-center gap-2" style={{ borderColor: 'var(--border-primary)', background: 'var(--surface-primary)' }}>
          <div className="relative flex-1">
            <svg
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
              style={{ color: 'var(--text-tertiary)' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search emoji..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="surface-input w-full pl-8 pr-7 py-1.5 text-xs rounded-xl"
              autoFocus
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs opacity-60 hover:opacity-100"
                style={{ color: 'var(--text-tertiary)' }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs Header */}
        {!search && (
          <div
            className="flex items-center justify-between px-1.5 py-1 border-b overflow-x-auto no-scrollbar"
            style={{
              borderColor: 'var(--border-primary)',
              background: 'var(--surface-secondary)',
            }}
          >
            {EMOJI_CATEGORIES.map((cat) => {
              const isActive = activeTab === cat.id
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleTabClick(cat.id)}
                  title={cat.name}
                  className="p-1.5 rounded-lg text-sm transition-all relative flex items-center justify-center flex-1"
                  style={{
                    background: isActive ? 'var(--accent-soft)' : 'transparent',
                    transform: isActive ? 'scale(1.15)' : 'scale(1)',
                  }}
                >
                  <span>{cat.icon}</span>
                </button>
              )
            })}
          </div>
        )}

        {/* Emoji Scroll Area */}
        <div
          ref={gridContainerRef}
          className="flex-1 overflow-y-auto p-3 space-y-4 text-left custom-scrollbar"
        >
          {searchResults ? (
            /* Search Results View */
            <div>
              <p className="text-2xs font-semibold uppercase tracking-wider mb-2 px-1" style={{ color: 'var(--text-tertiary)' }}>
                Search Results ({searchResults.length})
              </p>
              {searchResults.length === 0 ? (
                <div className="text-center py-10 opacity-60">
                  <p className="text-2xl mb-1">🔍</p>
                  <p className="text-xs">No emojis found</p>
                </div>
              ) : (
                <div className="grid grid-cols-8 gap-1">
                  {searchResults.map((item) => (
                    <button
                      key={item.char}
                      type="button"
                      onClick={() => handleEmojiClick(item.char)}
                      title={item.name}
                      className="w-9 h-9 flex items-center justify-center text-xl rounded-lg hover:scale-125 transition-transform"
                      style={{ background: 'transparent' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      {item.char}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Categorized Sections View */
            <>
              {/* Frequently Used / Recent */}
              <div id="emoji-cat-recent">
                <p className="text-2xs font-semibold uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5" style={{ color: 'var(--text-tertiary)' }}>
                  <span>🕒</span> Frequently Used
                </p>
                <div className="grid grid-cols-8 gap-1">
                  {recentEmojis.map((char, index) => (
                    <button
                      key={`recent-${char}-${index}`}
                      type="button"
                      onClick={() => handleEmojiClick(char)}
                      className="w-9 h-9 flex items-center justify-center text-xl rounded-lg hover:scale-125 transition-transform"
                      style={{ background: 'transparent' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      {char}
                    </button>
                  ))}
                </div>
              </div>

              {/* All Categories */}
              {EMOJI_CATEGORIES.filter((cat) => cat.id !== 'recent').map((cat) => (
                <div key={cat.id} id={`emoji-cat-${cat.id}`}>
                  <p className="text-2xs font-semibold uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5" style={{ color: 'var(--text-tertiary)' }}>
                    <span>{cat.icon}</span> {cat.name}
                  </p>
                  <div className="grid grid-cols-8 gap-1">
                    {cat.emojis.map((item) => (
                      <button
                        key={item.char}
                        type="button"
                        onClick={() => handleEmojiClick(item.char)}
                        title={item.name}
                        className="w-9 h-9 flex items-center justify-center text-xl rounded-lg hover:scale-125 transition-transform"
                        style={{ background: 'transparent' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        {item.char}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
