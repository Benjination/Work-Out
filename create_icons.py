from PIL import Image, ImageDraw
import os

# Create 192x192 icon
img = Image.new('RGB', (192, 192), color='black')
draw = ImageDraw.Draw(img)

# Draw red border
draw.rectangle([4, 4, 187, 187], outline='red', width=4)

# Draw simple dumbbell shape
# Left weight
draw.rectangle([24, 72, 40, 120], fill='red')
draw.rectangle([20, 76, 44, 84], fill='red')
draw.rectangle([20, 108, 44, 116], fill='red')

# Bar
draw.rectangle([40, 92, 152, 100], fill='red')

# Right weight  
draw.rectangle([152, 72, 168, 120], fill='red')
draw.rectangle([148, 76, 172, 84], fill='red')
draw.rectangle([148, 108, 172, 116], fill='red')

# Save
img.save('icon-192.png')

# Create 512x512 icon
img = Image.new('RGB', (512, 512), color='black')
draw = ImageDraw.Draw(img)

# Draw red border
draw.rectangle([10, 10, 501, 501], outline='red', width=8)

# Draw dumbbell
# Left weight
draw.rectangle([64, 192, 106, 320], fill='red')
draw.rectangle([54, 202, 116, 222], fill='red')
draw.rectangle([54, 290, 116, 310], fill='red')

# Bar
draw.rectangle([106, 246, 406, 266], fill='red')

# Right weight
draw.rectangle([406, 192, 448, 320], fill='red')
draw.rectangle([396, 202, 458, 222], fill='red')
draw.rectangle([396, 290, 458, 310], fill='red')

# Save
img.save('icon-512.png')
print('Icons created successfully!')