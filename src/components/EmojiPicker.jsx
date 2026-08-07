import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// EMOJI CATEGORIES
const EMOJI_CATEGORIES = [
  { id: 'recent', name: 'Frequently Used', icon: '🕒' },
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
      { char: '😋', name: 'face savoring food', tags: ['yum', 'delicious', 'tongue'] },
      { char: '😜', name: 'winking face with tongue', tags: ['tongue', 'wink', 'silly'] },
      { char: '🤪', name: 'zany face', tags: ['crazy', 'silly'] },
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
      { char: '😌', name: 'relieved face', tags: ['peaceful', 'calm'] },
      { char: '😔', name: 'pensive face', tags: ['sad', 'thoughtful'] },
      { char: '😪', name: 'sleepy face', tags: ['tired', 'sleep'] },
      { char: '🤤', name: 'drooling face', tags: ['drool', 'yummy'] },
      { char: '😴', name: 'sleeping face', tags: ['zzz', 'sleep', 'night'] },
      { char: '😷', name: 'face with medical mask', tags: ['sick', 'mask', 'covid'] },
      { char: '🤒', name: 'face with thermometer', tags: ['sick', 'fever'] },
      { char: '🤢', name: 'nauseated face', tags: ['gross', 'sick', 'disgust'] },
      { char: '🤮', name: 'face vomiting', tags: ['vomit', 'sick', 'barf'] },
      { char: '🥵', name: 'hot face', tags: ['hot', 'heat', 'sweating'] },
      { char: '🥶', name: 'cold face', tags: ['cold', 'freezing', 'ice'] },
      { char: '🥴', name: 'woozy face', tags: ['dizzy', 'drunk'] },
      { char: '🤯', name: 'exploding head', tags: ['mindblown', 'shock'] },
      { char: '🥳', name: 'partying face', tags: ['party', 'celebrate', 'birthday'] },
      { char: '😎', name: 'smiling face with sunglasses', tags: ['cool', 'sunglasses'] },
      { char: '🤓', name: 'nerd face', tags: ['nerd', 'geek', 'glasses'] },
      { char: '🧐', name: 'face with monocle', tags: ['monocle', 'curious'] },
      { char: '😕', name: 'confused face', tags: ['confused', 'huh'] },
      { char: '😟', name: 'worried face', tags: ['worried', 'nervous'] },
      { char: '😮', name: 'face with open mouth', tags: ['surprise', 'wow'] },
      { char: '😲', name: 'astonished face', tags: ['shocked', 'gasp'] },
      { char: '😳', name: 'flushed face', tags: ['blush', 'embarrassed'] },
      { char: '🥺', name: 'pleading face', tags: ['puppy eyes', 'please', 'beg'] },
      { char: '😢', name: 'crying face', tags: ['cry', 'sad', 'tear'] },
      { char: '😭', name: 'loudly crying face', tags: ['sob', 'cry', 'sad'] },
      { char: '😱', name: 'face screaming in fear', tags: ['scream', 'scared'] },
      { char: '😤', name: 'face with steam from nose', tags: ['huff', 'triumph', 'angry'] },
      { char: '😡', name: 'enraged face', tags: ['angry', 'mad', 'rage'] },
      { char: '😠', name: 'angry face', tags: ['mad', 'annoyed'] },
      { char: '🤬', name: 'face with symbols on mouth', tags: ['curse', 'swearing', 'angry'] },
      { char: '😈', name: 'smiling face with horns', tags: ['devil', 'evil'] },
      { char: '💀', name: 'skull', tags: ['dead', 'skeleton', 'death'] },
      { char: '💩', name: 'pile of poop', tags: ['poop', 'poo', 'crap'] },
      { char: '🤡', name: 'clown face', tags: ['clown', 'joke'] },
      { char: '👻', name: 'ghost', tags: ['halloween', 'spooky', 'ghost'] },
      { char: '👽', name: 'alien', tags: ['extraterrestrial', 'space'] },
      { char: '🤖', name: 'robot', tags: ['bot', 'tech'] },
      { char: '😺', name: 'grinning cat', tags: ['cat', 'smile'] },
      { char: '😻', name: 'smiling cat with heart-eyes', tags: ['cat', 'love'] },
    ],
  },
  {
    id: 'people',
    name: 'People & Gestures',
    icon: '👋',
    emojis: [
      { char: '👋', name: 'waving hand', tags: ['wave', 'hello', 'bye'] },
      { char: '✋', name: 'raised hand', tags: ['stop', 'highfive'] },
      { char: '👌', name: 'OK hand', tags: ['ok', 'perfect'] },
      { char: '✌️', name: 'victory hand', tags: ['peace', 'victory'] },
      { char: '🤞', name: 'crossed fingers', tags: ['luck', 'hope'] },
      { char: '🤟', name: 'love-you gesture', tags: ['ily', 'love'] },
      { char: '🤘', name: 'sign of the horns', tags: ['rock', 'metal'] },
      { char: '🤙', name: 'call me hand', tags: ['call', 'shaka'] },
      { char: '👈', name: 'pointing left', tags: ['left', 'point'] },
      { char: '👉', name: 'pointing right', tags: ['right', 'point'] },
      { char: '👆', name: 'pointing up', tags: ['up', 'point'] },
      { char: '👇', name: 'pointing down', tags: ['down', 'point'] },
      { char: '👍', name: 'thumbs up', tags: ['like', 'yes', 'good'] },
      { char: '👎', name: 'thumbs down', tags: ['dislike', 'no', 'bad'] },
      { char: '✊', name: 'raised fist', tags: ['fist', 'power'] },
      { char: '👊', name: 'oncoming fist', tags: ['punch', 'fistbump'] },
      { char: '👏', name: 'clapping hands', tags: ['clap', 'applause'] },
      { char: '🙌', name: 'raising hands', tags: ['celebrate', 'praise'] },
      { char: '👐', name: 'open hands', tags: ['hug', 'open'] },
      { char: '🤝', name: 'handshake', tags: ['deal', 'agreement'] },
      { char: '🙏', name: 'folded hands', tags: ['pray', 'please', 'thanks'] },
      { char: '💅', name: 'nail polish', tags: ['nails', 'sassy'] },
      { char: '🤳', name: 'selfie', tags: ['camera', 'selfie'] },
      { char: '💪', name: 'flexed biceps', tags: ['strong', 'muscle', 'gym'] },
      { char: '👀', name: 'eyes', tags: ['look', 'see', 'peek'] },
      { char: '👶', name: 'baby', tags: ['child', 'infant'] },
      { char: '👦', name: 'boy', tags: ['male'] },
      { char: '👧', name: 'girl', tags: ['female'] },
      { char: '👨', name: 'man', tags: ['male'] },
      { char: '👩', name: 'woman', tags: ['female'] },
      { char: '👵', name: 'old woman', tags: ['grandma'] },
      { char: '👴', name: 'old man', tags: ['grandpa'] },
      { char: '👮‍♂️', name: 'police officer', tags: ['cop'] },
      { char: '🕵️‍♀️', name: 'detective', tags: ['spy'] },
      { char: '👨‍💻', name: 'technologist', tags: ['coder', 'developer'] },
      { char: '🤴', name: 'prince', tags: ['king', 'royal'] },
      { char: '👸', name: 'princess', tags: ['queen', 'royal'] },
      { char: '💃', name: 'woman dancing', tags: ['dance', 'party'] },
      { char: '🕺', name: 'man dancing', tags: ['disco', 'dance'] },
    ],
  },
  {
    id: 'animals',
    name: 'Animals & Nature',
    icon: '🐶',
    emojis: [
      { char: '🐶', name: 'dog face', tags: ['dog', 'puppy'] },
      { char: '🐱', name: 'cat face', tags: ['cat', 'kitty'] },
      { char: '🐭', name: 'mouse face', tags: ['mouse'] },
      { char: '🐹', name: 'hamster', tags: ['hamster'] },
      { char: '🐰', name: 'rabbit face', tags: ['bunny'] },
      { char: '🦊', name: 'fox', tags: ['fox'] },
      { char: '🐻', name: 'bear', tags: ['bear'] },
      { char: '🐼', name: 'panda', tags: ['panda'] },
      { char: '🐨', name: 'koala', tags: ['koala'] },
      { char: '🐯', name: 'tiger face', tags: ['tiger'] },
      { char: '🦁', name: 'lion', tags: ['lion'] },
      { char: '🐮', name: 'cow face', tags: ['cow'] },
      { char: '🐷', name: 'pig face', tags: ['pig'] },
      { char: '🐸', name: 'frog', tags: ['frog'] },
      { char: '🐵', name: 'monkey face', tags: ['monkey'] },
      { char: '🐔', name: 'chicken', tags: ['hen'] },
      { char: '🐧', name: 'penguin', tags: ['bird'] },
      { char: '🐦', name: 'bird', tags: ['bird'] },
      { char: '🦆', name: 'duck', tags: ['quack'] },
      { char: '🦅', name: 'eagle', tags: ['bird'] },
      { char: '🦉', name: 'owl', tags: ['bird'] },
      { char: '🐴', name: 'horse face', tags: ['horse'] },
      { char: '🦄', name: 'unicorn', tags: ['magic'] },
      { char: '🐝', name: 'honeybee', tags: ['bee'] },
      { char: '🐛', name: 'bug', tags: ['insect'] },
      { char: '🦋', name: 'butterfly', tags: ['beauty'] },
      { char: '🐢', name: 'turtle', tags: ['slow'] },
      { char: '🐍', name: 'snake', tags: ['reptile'] },
      { char: '🐙', name: 'octopus', tags: ['sea'] },
      { char: '🐬', name: 'dolphin', tags: ['sea'] },
      { char: '🐳', name: 'whale', tags: ['ocean'] },
      { char: '🦈', name: 'shark', tags: ['danger'] },
      { char: '🌲', name: 'evergreen tree', tags: ['tree'] },
      { char: '🌴', name: 'palm tree', tags: ['beach'] },
      { char: '🌵', name: 'cactus', tags: ['desert'] },
      { char: '🍀', name: 'clover', tags: ['luck'] },
      { char: '🍁', name: 'maple leaf', tags: ['fall'] },
      { char: '🌹', name: 'rose', tags: ['flower', 'love'] },
      { char: '🌸', name: 'cherry blossom', tags: ['flower'] },
      { char: '🌻', name: 'sunflower', tags: ['flower'] },
      { char: '🔥', name: 'fire', tags: ['flame', 'lit', 'hot'] },
      { char: '✨', name: 'sparkles', tags: ['magic', 'glitter'] },
      { char: '⚡️', name: 'lightning', tags: ['zap', 'power'] },
      { char: '🌈', name: 'rainbow', tags: ['color'] },
      { char: '🌊', name: 'water wave', tags: ['ocean'] },
    ],
  },
  {
    id: 'food',
    name: 'Food & Drink',
    icon: '🍔',
    emojis: [
      { char: '🍏', name: 'green apple', tags: ['apple'] },
      { char: '🍎', name: 'red apple', tags: ['apple'] },
      { char: '🍌', name: 'banana', tags: ['fruit'] },
      { char: '🍉', name: 'watermelon', tags: ['summer'] },
      { char: '🍇', name: 'grapes', tags: ['fruit'] },
      { char: '🍓', name: 'strawberry', tags: ['fruit'] },
      { char: '🍒', name: 'cherries', tags: ['fruit'] },
      { char: '🍑', name: 'peach', tags: ['fruit'] },
      { char: '🍍', name: 'pineapple', tags: ['fruit'] },
      { char: '🥑', name: 'avocado', tags: ['guacamole'] },
      { char: '🍕', name: 'pizza', tags: ['slice', 'cheese'] },
      { char: '🍔', name: 'hamburger', tags: ['burger'] },
      { char: '🍟', name: 'french fries', tags: ['fries'] },
      { char: '🌭', name: 'hot dog', tags: ['fast food'] },
      { char: '🌮', name: 'taco', tags: ['mexican'] },
      { char: '🌯', name: 'burrito', tags: ['wrap'] },
      { char: '🍿', name: 'popcorn', tags: ['movie'] },
      { char: '🍱', name: 'bento box', tags: ['sushi'] },
      { char: '🍜', name: 'ramen bowl', tags: ['noodes'] },
      { char: '🍝', name: 'spaghetti', tags: ['pasta'] },
      { char: '🍣', name: 'sushi', tags: ['japanese'] },
      { char: '🍩', name: 'donut', tags: ['sweet'] },
      { char: '🍪', name: 'cookie', tags: ['snack'] },
      { char: '🎂', name: 'birthday cake', tags: ['celebrate'] },
      { char: '🍰', name: 'shortcake', tags: ['cake'] },
      { char: '🧁', name: 'cupcake', tags: ['sweet'] },
      { char: '🍫', name: 'chocolate', tags: ['sweet'] },
      { char: '☕️', name: 'coffee', tags: ['hot', 'tea'] },
      { char: '🍺', name: 'beer mug', tags: ['drink', 'cheers'] },
      { char: '🍻', name: 'clinking beers', tags: ['cheers'] },
      { char: '🥂', name: 'champagne glasses', tags: ['toast'] },
      { char: '🧃', name: 'juice box', tags: ['drink'] },
    ],
  },
  {
    id: 'sports',
    name: 'Activities & Sports',
    icon: '⚽',
    emojis: [
      { char: '⚽️', name: 'soccer ball', tags: ['sports'] },
      { char: '🏀', name: 'basketball', tags: ['sports'] },
      { char: '🏈', name: 'football', tags: ['sports'] },
      { char: '⚾️', name: 'baseball', tags: ['sports'] },
      { char: '🎾', name: 'tennis', tags: ['sports'] },
      { char: '🏐', name: 'volleyball', tags: ['sports'] },
      { char: '🎱', name: 'pool ball', tags: ['billiards'] },
      { char: '🏓', name: 'ping pong', tags: ['table tennis'] },
      { char: '🏒', name: 'ice hockey', tags: ['sports'] },
      { char: '🏏', name: 'cricket', tags: ['sports'] },
      { char: '🥊', name: 'boxing glove', tags: ['fight'] },
      { char: '🏋️‍♂️', name: 'weightlifting', tags: ['gym'] },
      { char: '🧘‍♀️', name: 'yoga', tags: ['meditate'] },
      { char: '🏄‍♂️', name: 'surfing', tags: ['surf'] },
      { char: '🏊‍♂️', name: 'swimming', tags: ['swim'] },
      { char: '🎯', name: 'bullseye', tags: ['target'] },
      { char: '🎮', name: 'video game', tags: ['playstation', 'xbox'] },
      { char: '🎲', name: 'dice', tags: ['game'] },
      { char: '🎨', name: 'paint palette', tags: ['art'] },
      { char: '🎭', name: 'theater masks', tags: ['drama'] },
      { char: '🎤', name: 'microphone', tags: ['sing'] },
      { char: '🎧', name: 'headphones', tags: ['music'] },
      { char: '🎸', name: 'guitar', tags: ['music'] },
      { char: '🎬', name: 'clapperboard', tags: ['movie'] },
      { char: '🏆', name: 'trophy', tags: ['winner'] },
      { char: '🥇', name: 'gold medal', tags: ['first'] },
    ],
  },
  {
    id: 'travel',
    name: 'Travel & Places',
    icon: '🚀',
    emojis: [
      { char: '🚗', name: 'car', tags: ['drive'] },
      { char: '🚕', name: 'taxi', tags: ['cab'] },
      { char: '🏎️', name: 'race car', tags: ['f1'] },
      { char: '🚓', name: 'police car', tags: ['cop'] },
      { char: '🚑', name: 'ambulance', tags: ['medical'] },
      { char: '🚲', name: 'bicycle', tags: ['bike'] },
      { char: '🏍️', name: 'motorcycle', tags: ['bike'] },
      { char: '🚨', name: 'police light', tags: ['alert'] },
      { char: '🚄', name: 'bullet train', tags: ['speed'] },
      { char: '✈️', name: 'airplane', tags: ['flight'] },
      { char: '🚀', name: 'rocket', tags: ['space', 'launch'] },
      { char: '🛸', name: 'ufo', tags: ['alien'] },
      { char: '🚁', name: 'helicopter', tags: ['flight'] },
      { char: '⛵️', name: 'sailboat', tags: ['sea'] },
      { char: '🗿', name: 'moai', tags: ['stone'] },
      { char: '🗽', name: 'statue of liberty', tags: ['usa'] },
      { char: '🗼', name: 'tokyo tower', tags: ['japan'] },
      { char: '🏰', name: 'castle', tags: ['fairytale'] },
      { char: '🎡', name: 'ferris wheel', tags: ['park'] },
      { char: '🎢', name: 'roller coaster', tags: ['park'] },
      { char: '🌅', name: 'sunrise', tags: ['morning'] },
      { char: '🏙️', name: 'cityscape', tags: ['city'] },
    ],
  },
  {
    id: 'objects',
    name: 'Objects & Technology',
    icon: '💡',
    emojis: [
      { char: '⌚️', name: 'watch', tags: ['clock'] },
      { char: '📱', name: 'phone', tags: ['smartphone'] },
      { char: '💻', name: 'laptop', tags: ['computer'] },
      { char: '⌨️', name: 'keyboard', tags: ['tech'] },
      { char: '🖥️', name: 'desktop', tags: ['monitor'] },
      { char: '📷', name: 'camera', tags: ['photo'] },
      { char: '💡', name: 'light bulb', tags: ['idea'] },
      { char: '📖', name: 'book', tags: ['read'] },
      { char: '📚', name: 'books', tags: ['study'] },
      { char: '💰', name: 'money bag', tags: ['cash'] },
      { char: '💵', name: 'dollar banknote', tags: ['money'] },
      { char: '💳', name: 'credit card', tags: ['pay'] },
      { char: '✉️', name: 'envelope', tags: ['mail'] },
      { char: '📦', name: 'package', tags: ['box'] },
      { char: '✏️', name: 'pencil', tags: ['write'] },
      { char: '📅', name: 'calendar', tags: ['date'] },
      { char: '📌', name: 'pushpin', tags: ['pin'] },
      { char: '🔒', name: 'locked', tags: ['security'] },
      { char: '🔑', name: 'key', tags: ['unlock'] },
      { char: '🔨', name: 'hammer', tags: ['tool'] },
      { char: '🛡️', name: 'shield', tags: ['guard'] },
      { char: '⚙️', name: 'gear', tags: ['settings'] },
      { char: '🔔', name: 'bell', tags: ['notification'] },
    ],
  },
  {
    id: 'symbols',
    name: 'Symbols & Flags',
    icon: '❤️',
    emojis: [
      { char: '❤️', name: 'red heart', tags: ['love'] },
      { char: '🧡', name: 'orange heart', tags: ['love'] },
      { char: '💛', name: 'yellow heart', tags: ['love'] },
      { char: '💚', name: 'green heart', tags: ['love'] },
      { char: '💙', name: 'blue heart', tags: ['love'] },
      { char: '💜', name: 'purple heart', tags: ['love'] },
      { char: '🖤', name: 'black heart', tags: ['love'] },
      { char: '🤍', name: 'white heart', tags: ['love'] },
      { char: '💔', name: 'broken heart', tags: ['sad'] },
      { char: '💕', name: 'two hearts', tags: ['love'] },
      { char: '💖', name: 'sparkling heart', tags: ['love'] },
      { char: '💘', name: 'cupid heart', tags: ['love'] },
      { char: '☮️', name: 'peace', tags: ['symbol'] },
      { char: '✝️', name: 'cross', tags: ['christian'] },
      { char: '☪️', name: 'star and crescent', tags: ['islam'] },
      { char: '🕉️', name: 'om', tags: ['hindu'] },
      { char: '☯️', name: 'yin yang', tags: ['balance'] },
      { char: '💯', name: 'hundred points', tags: ['100', 'score'] },
      { char: '⚠️', name: 'warning', tags: ['alert'] },
      { char: '🏁', name: 'chequered flag', tags: ['finish'] },
      { char: '🇮🇳', name: 'flag India', tags: ['india'] },
      { char: '🇺🇸', name: 'flag USA', tags: ['usa'] },
      { char: '🇬🇧', name: 'flag UK', tags: ['uk'] },
      { char: '🇨🇦', name: 'flag Canada', tags: ['canada'] },
      { char: '🇦🇺', name: 'flag Australia', tags: ['australia'] },
      { char: '🇩🇪', name: 'flag Germany', tags: ['germany'] },
      { char: '🇫🇷', name: 'flag France', tags: ['france'] },
      { char: '🇯🇵', name: 'flag Japan', tags: ['japan'] },
      { char: '🇰🇷', name: 'flag South Korea', tags: ['korea'] },
    ],
  },
]

// STICKER PACKS
const STICKER_PACKS = [
  {
    id: 'cats',
    name: 'Cute Cats',
    icon: '🐱',
    stickers: [
      { id: 'cat-1', title: 'Happy Cat', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3hvcWF2a3hpeWRxeXFzeDZvZm9ldnlhbThwMHVwNzlsbmlrcDFvMCZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/CjmvTCZf2U3p09Cn0h/giphy.gif' },
      { id: 'cat-2', title: 'Dancing Cat', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3hvcWF2a3hpeWRxeXFzeDZvZm9ldnlhbThwMHVwNzlsbmlrcDFvMCZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/GeimqsH0TLDt4tScGw/giphy.gif' },
      { id: 'cat-3', title: 'Love Cat', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3hvcWF2a3hpeWRxeXFzeDZvZm9ldnlhbThwMHVwNzlsbmlrcDFvMCZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/BzyTuYCmvSORqs1ABM/giphy.gif' },
      { id: 'cat-4', title: 'Sleeping Cat', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3hvcWF2a3hpeWRxeXFzeDZvZm9ldnlhbThwMHVwNzlsbmlrcDFvMCZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/Lq0h93752f6J9tijrh/giphy.gif' },
      { id: 'cat-5', title: 'Hacker Cat', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3hvcWF2a3hpeWRxeXFzeDZvZm9ldnlhbThwMHVwNzlsbmlrcDFvMCZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/mlvseq9yvZhba/giphy.gif' },
      { id: 'cat-6', title: 'Shocked Cat', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3hvcWF2a3hpeWRxeXFzeDZvZm9ldnlhbThwMHVwNzlsbmlrcDFvMCZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/VbnUQpnihPSIgIXuZv/giphy.gif' },
      { id: 'cat-7', title: 'Playful Cat', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3hvcWF2a3hpeWRxeXFzeDZvZm9ldnlhbThwMHVwNzlsbmlrcDFvMCZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/13CoXDiaCcCoyk/giphy.gif' },
      { id: 'cat-8', title: 'Party Cat', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3hvcWF2a3hpeWRxeXFzeDZvZm9ldnlhbThwMHVwNzlsbmlrcDFvMCZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/3o6Zt481isNVuQI1l6/giphy.gif' },
    ],
  },
  {
    id: 'memes',
    name: 'Pepe & Memes',
    icon: '🐸',
    stickers: [
      { id: 'meme-1', title: 'Pepe Dance', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMml3M3U3Z3p3enU0bnYwcmlqZmsxZjN2OHY5dXZrbHRxZmd3ZndwdyZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/c4Nc0v0g15g9A5v0GA/giphy.gif' },
      { id: 'meme-2', title: 'Hype Meme', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMml3M3U3Z3p3enU0bnYwcmlqZmsxZjN2OHY5dXZrbHRxZmd3ZndwdyZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/u08yPugMhiL1d3cE7A/giphy.gif' },
      { id: 'meme-3', title: 'Smug Pepe', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMml3M3U3Z3p3enU0bnYwcmlqZmsxZjN2OHY5dXZrbHRxZmd3ZndwdyZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/t3sZxY5zS5B0z5z5z5/giphy.gif' },
      { id: 'meme-4', title: 'Popcorn Meme', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMml3M3U3Z3p3enU0bnYwcmlqZmsxZjN2OHY5dXZrbHRxZmd3ZndwdyZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/A9A5n697CqA9hO1j1n/giphy.gif' },
      { id: 'meme-5', title: 'Mindblown Meme', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMml3M3U3Z3p3enU0bnYwcmlqZmsxZjN2OHY5dXZrbHRxZmd3ZndwdyZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/S6ED7y7r85Vw8F6E6k/giphy.gif' },
      { id: 'meme-6', title: 'OK Hand Meme', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMml3M3U3Z3p3enU0bnYwcmlqZmsxZjN2OHY5dXZrbHRxZmd3ZndwdyZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/dlsGM46Xy0wZ3B3z3z/giphy.gif' },
    ],
  },
  {
    id: 'pandas',
    name: 'Panda & Bears',
    icon: '🐼',
    stickers: [
      { id: 'panda-1', title: 'Panda Wave', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYnJ2OW0wYml3cWpxZ21pZHF4dWR2ZW81M2RreWpmZ3pxZmpjNXZ6byZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/l0HlOBZyy8jTNVTOU/giphy.gif' },
      { id: 'panda-2', title: 'Bear Hug', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYnJ2OW0wYml3cWpxZ21pZHF4dWR2ZW81M2RreWpmZ3pxZmpjNXZ6byZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/3o7TKSjRrfIPjeiVyM/giphy.gif' },
      { id: 'panda-3', title: 'Coffee Panda', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYnJ2OW0wYml3cWpxZ21pZHF4dWR2ZW81M2RreWpmZ3pxZmpjNXZ6byZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/l49JHz7kJLkqPZJwQ/giphy.gif' },
      { id: 'panda-4', title: 'Heart Bear', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYnJ2OW0wYml3cWpxZ21pZHF4dWR2ZW81M2RreWpmZ3pxZmpjNXZ6byZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/3oKIPnAiaMCws8nOsE/giphy.gif' },
      { id: 'panda-5', title: 'Sleeping Panda', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYnJ2OW0wYml3cWpxZ21pZHF4dWR2ZW81M2RreWpmZ3pxZmpjNXZ6byZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/26xBI73gWquCBBCDe/giphy.gif' },
    ],
  },
  {
    id: 'anime',
    name: 'Anime & Chibi',
    icon: '🌸',
    stickers: [
      { id: 'anime-1', title: 'Sparkle Chibi', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExd2J2b2d0OGY2dmszc3E1NDBndHJmdWVhOHZlZjF2dXpxbXRlYm1vMiZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/13CoXDiaCcCoyk/giphy.gif' },
      { id: 'anime-2', title: 'Shocked Anime', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExd2J2b2d0OGY2dmszc3E1NDBndHJmdWVhOHZlZjF2dXpxbXRlYm1vMiZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/10UeedrT5MIfPG/giphy.gif' },
      { id: 'anime-3', title: 'Fight Mode', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExd2J2b2d0OGY2dmszc3E1NDBndHJmdWVhOHZlZjF2dXpxbXRlYm1vMiZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/3o7aD6Y0qM4L8cQZ04/giphy.gif' },
      { id: 'anime-4', title: 'Victory Wink', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExd2J2b2d0OGY2dmszc3E1NDBndHJmdWVhOHZlZjF2dXpxbXRlYm1vMiZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/l0HlHFRb4OMYYYn3W/giphy.gif' },
    ],
  },
]

// CURATED GIFS COLLECTION
const GIF_GALLERY = [
  { id: 'g1', title: 'Happy Dance', category: 'happy', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3hvcWF2a3hpeWRxeXFzeDZvZm9ldnlhbThwMHVwNzlsbmlrcDFvMCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/blSTtZehjAZ8I/giphy.gif' },
  { id: 'g2', title: 'Joyful Celebration', category: 'happy', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3hvcWF2a3hpeWRxeXFzeDZvZm9ldnlhbThwMHVwNzlsbmlrcDFvMCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/artj92V8o75VPL7AeQ/giphy.gif' },
  { id: 'g3', title: 'Groovy Dance', category: 'dance', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3hvcWF2a3hpeWRxeXFzeDZvZm9ldnlhbThwMHVwNzlsbmlrcDFvMCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/lu0u0j9xMFLSjYk9yU/giphy.gif' },
  { id: 'g4', title: 'Laughing Out Loud', category: 'laugh', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3hvcWF2a3hpeWRxeXFzeDZvZm9ldnlhbThwMHVwNzlsbmlrcDFvMCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/10ls7c9q3Q6m9d2j20/giphy.gif' },
  { id: 'g5', title: 'ROFL Cat', category: 'laugh', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3hvcWF2a3hpeWRxeXFzeDZvZm9ldnlhbThwMHVwNzlsbmlrcDFvMCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/ro08Wv3zVypWXTOwiv/giphy.gif' },
  { id: 'g6', title: 'Mindblown Reaction', category: 'wow', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3hvcWF2a3hpeWRxeXFzeDZvZm9ldnlhbThwMHVwNzlsbmlrcDFvMCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/26ufdipQqU2lhNA4g/giphy.gif' },
  { id: 'g7', title: 'Astonished Eye Pop', category: 'wow', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3hvcWF2a3hpeWRxeXFzeDZvZm9ldnlhbThwMHVwNzlsbmlrcDFvMCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/xT0xezQGU5xCDJuCPe/giphy.gif' },
  { id: 'g8', title: 'Sending Love', category: 'love', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3hvcWF2a3hpeWRxeXFzeDZvZm9ldnlhbThwMHVwNzlsbmlrcDFvMCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/l8vT5et8lLyDLETSLt/giphy.gif' },
  { id: 'g9', title: 'Heart Hug', category: 'love', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3hvcWF2a3hpeWRxeXFzeDZvZm9ldnlhbThwMHVwNzlsbmlrcDFvMCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/v9G3NGByE9x16/giphy.gif' },
  { id: 'g10', title: 'Popcorn Cat', category: 'cat', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3hvcWF2a3hpeWRxeXFzeDZvZm9ldnlhbThwMHVwNzlsbmlrcDFvMCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/CjmvTCZf2U3p09Cn0h/giphy.gif' },
]

const STORAGE_KEY_RECENT = 'nodetalk_recent_emojis'
const DEFAULT_RECENTS = ['😂', '❤️', '👍', '🔥', '😊', '🙌', '😍', '🎉', '💯', '✨']

export default function EmojiPicker({ onSelect, onSelectMedia, open, onClose }) {
  const ref = useRef(null)
  const gridContainerRef = useRef(null)
  const [pickerMode, setPickerMode] = useState('emojis') // 'emojis' | 'stickers' | 'gifs'
  const [activeEmojiTab, setActiveEmojiTab] = useState('smileys')
  const [activeStickerPack, setActiveStickerPack] = useState('cats')
  const [activeGifTag, setActiveGifTag] = useState('all')
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

  // Handle emoji selection
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

  // Handle media selection (Sticker / GIF)
  const handleMediaClick = useCallback((url) => {
    onSelectMedia?.(url)
    onClose?.()
  }, [onSelectMedia, onClose])

  // Scroll to section when emoji tab is clicked
  const handleEmojiTabClick = (catId) => {
    setActiveEmojiTab(catId)
    setSearch('')
    if (gridContainerRef.current) {
      const targetElement = gridContainerRef.current.querySelector(`#emoji-cat-${catId}`)
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }

  // Filtered emojis
  const searchEmojiResults = useMemo(() => {
    if (pickerMode !== 'emojis' || !search.trim()) return null
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
  }, [pickerMode, search])

  // Filtered GIFs
  const filteredGifs = useMemo(() => {
    if (pickerMode !== 'gifs') return []
    let list = GIF_GALLERY
    if (activeGifTag !== 'all') {
      list = list.filter((g) => g.category === activeGifTag)
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim()
      list = list.filter((g) => g.title.toLowerCase().includes(q) || g.category.includes(q))
    }
    return list
  }, [pickerMode, activeGifTag, search])

  if (!open) return null

  return (
    <AnimatePresence>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="absolute bottom-full left-0 mb-3 z-50 flex flex-col w-[350px] h-[410px] rounded-2xl shadow-2xl overflow-hidden border"
        style={{
          background: 'var(--surface-elevated)',
          borderColor: 'var(--border-secondary)',
          boxShadow: 'var(--shadow-popover)',
        }}
      >
        {/* Top Mode Selector Tabs: Emojis | Stickers | GIFs */}
        <div
          className="flex items-center justify-between px-3 py-2 border-b"
          style={{
            background: 'var(--surface-primary)',
            borderColor: 'var(--border-primary)',
          }}
        >
          {[
            { id: 'emojis', label: '😀 Emojis' },
            { id: 'stickers', label: '🏷️ Stickers' },
            { id: 'gifs', label: '🎬 GIFs' },
          ].map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => {
                setPickerMode(mode.id)
                setSearch('')
              }}
              className="flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all text-center"
              style={{
                color: pickerMode === mode.id ? 'var(--accent)' : 'var(--text-tertiary)',
                background: pickerMode === mode.id ? 'var(--accent-soft)' : 'transparent',
              }}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="p-2 border-b flex items-center gap-2" style={{ borderColor: 'var(--border-primary)', background: 'var(--surface-primary)' }}>
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
              placeholder={pickerMode === 'emojis' ? 'Search emoji...' : pickerMode === 'stickers' ? 'Search stickers...' : 'Search GIFs...'}
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

        {/* MODE 1: EMOJIS */}
        {pickerMode === 'emojis' && (
          <>
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
                  const isActive = activeEmojiTab === cat.id
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleEmojiTabClick(cat.id)}
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

            {/* Emoji Scroll Grid */}
            <div
              ref={gridContainerRef}
              className="flex-1 overflow-y-auto p-3 space-y-4 text-left custom-scrollbar"
            >
              {searchEmojiResults ? (
                <div>
                  <p className="text-2xs font-semibold uppercase tracking-wider mb-2 px-1" style={{ color: 'var(--text-tertiary)' }}>
                    Search Results ({searchEmojiResults.length})
                  </p>
                  {searchEmojiResults.length === 0 ? (
                    <div className="text-center py-10 opacity-60">
                      <p className="text-2xl mb-1">🔍</p>
                      <p className="text-xs">No emojis found</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-8 gap-1">
                      {searchEmojiResults.map((item) => (
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
                <>
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
          </>
        )}

        {/* MODE 2: STICKERS */}
        {pickerMode === 'stickers' && (
          <>
            {/* Sticker Pack Tabs */}
            <div
              className="flex items-center gap-1 px-2 py-1.5 border-b overflow-x-auto no-scrollbar"
              style={{
                borderColor: 'var(--border-primary)',
                background: 'var(--surface-secondary)',
              }}
            >
              {STICKER_PACKS.map((pack) => {
                const isActive = activeStickerPack === pack.id
                return (
                  <button
                    key={pack.id}
                    type="button"
                    onClick={() => setActiveStickerPack(pack.id)}
                    className="px-2.5 py-1 text-xs font-medium rounded-lg flex items-center gap-1.5 flex-shrink-0 transition-all"
                    style={{
                      background: isActive ? 'var(--accent-soft)' : 'transparent',
                      color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                    }}
                  >
                    <span>{pack.icon}</span>
                    <span>{pack.name}</span>
                  </button>
                )
              })}
            </div>

            {/* Sticker Grid */}
            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
              {STICKER_PACKS.filter((p) => p.id === activeStickerPack).map((pack) => (
                <div key={pack.id} className="grid grid-cols-4 gap-2">
                  {pack.stickers.map((st) => (
                    <motion.button
                      key={st.id}
                      type="button"
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleMediaClick(st.url)}
                      className="p-1.5 rounded-xl border flex items-center justify-center transition-all group relative"
                      style={{
                        borderColor: 'var(--border-primary)',
                        background: 'var(--surface-primary)',
                      }}
                    >
                      <img
                        src={st.url}
                        alt={st.title}
                        className="w-16 h-16 object-contain pointer-events-none"
                        loading="lazy"
                      />
                    </motion.button>
                  ))}
                </div>
              ))}
            </div>
          </>
        )}

        {/* MODE 3: GIFs */}
        {pickerMode === 'gifs' && (
          <>
            {/* GIF Reaction Tags */}
            <div
              className="flex items-center gap-1 px-2 py-1.5 border-b overflow-x-auto no-scrollbar"
              style={{
                borderColor: 'var(--border-primary)',
                background: 'var(--surface-secondary)',
              }}
            >
              {[
                { id: 'all', label: 'All' },
                { id: 'happy', label: '😊 Happy' },
                { id: 'dance', label: '💃 Dance' },
                { id: 'laugh', label: '😂 Laugh' },
                { id: 'love', label: '❤️ Love' },
                { id: 'wow', label: '🤯 Wow' },
                { id: 'cat', label: '🐱 Cat' },
              ].map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => setActiveGifTag(tag.id)}
                  className="px-2.5 py-1 text-2xs font-medium rounded-full flex-shrink-0 transition-all"
                  style={{
                    background: activeGifTag === tag.id ? 'var(--accent)' : 'var(--surface-tertiary)',
                    color: activeGifTag === tag.id ? 'white' : 'var(--text-secondary)',
                  }}
                >
                  {tag.label}
                </button>
              ))}
            </div>

            {/* GIF Gallery Grid */}
            <div className="flex-1 overflow-y-auto p-2.5 custom-scrollbar">
              {filteredGifs.length === 0 ? (
                <div className="text-center py-10 opacity-60">
                  <p className="text-2xl mb-1">🎬</p>
                  <p className="text-xs">No GIFs found</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {filteredGifs.map((gif) => (
                    <motion.button
                      key={gif.id}
                      type="button"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleMediaClick(gif.url)}
                      className="rounded-xl overflow-hidden border relative group aspect-video"
                      style={{
                        borderColor: 'var(--border-primary)',
                        background: 'black',
                      }}
                    >
                      <img
                        src={gif.url}
                        alt={gif.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5">
                        <span className="text-[10px] text-white font-medium truncate">{gif.title}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
