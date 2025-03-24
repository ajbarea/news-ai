# Import the required module for text 
# to speech conversion
from gtts import gTTS
# Gotta love geeks for geeks https://www.geeksforgeeks.org/convert-text-speech-python/

# This module is imported so that we can 
# play the converted audio
import os

# The text that you want to convert to audio
# mytext = 'The quick brown fox jumps over the lazy dog'
mytext = 'harizard-ed the price up. The Cheetozard is not a McDonald’s chicken nugget, but it’s in the same category of “weird and hard to find food item that somehow got made into a character from Pokémon.” (The nugget was also not originally listed for 99 cents.) In 2021, an extremely rare Pokémon card featuring the original 151 creatures sold at auction for $3.6 million. A 1st Pikachu card is among a few other Pokémon cards that have gone for millions in recent years. But again, these are not the same type of item.We should also mention there’s no telling what the Cheetozard is made out of. As one of my friends asked, “Is it just a normal Cheeto painted with food coloring to look like Charizard?” While it may not be 100 percent authentic, and may only be worth a few bucks in normal, non-Pokémon-themed situations, Goldin says the Cheetozard is one of a kind. “It’s definitely the only one in existence,” said the company’s representative.'

# Language in which you want to convert
language = 'en'

# Passing the text and language to the engine, 
# here we have marked slow=False. Which tells 
# the module that the converted audio should 
# have a high speed
myobj = gTTS(text=mytext, lang=language, slow=False)

# Saving the converted audio in a mp3 file named
# welcome 
myobj.save("welcome.mp3")

# Playing the converted file
os.system("start welcome.mp3")