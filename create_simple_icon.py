# Simple script to create workout icons
from PIL import Image, ImageDraw, ImageFont

def create_icon(size, filename):
    # Create image with blue gradient background
    img = Image.new('RGB', (size, size), '#2196F3')
    draw = ImageDraw.Draw(img)
    
    # Create a simple dumbbell icon
    center_x, center_y = size // 2, size // 2
    
    # Dumbbell dimensions
    bar_width = size // 3
    bar_height = size // 12
    weight_size = size // 6
    
    # Draw bar
    bar_x1 = center_x - bar_width // 2
    bar_y1 = center_y - bar_height // 2
    bar_x2 = center_x + bar_width // 2
    bar_y2 = center_y + bar_height // 2
    draw.rectangle([bar_x1, bar_y1, bar_x2, bar_y2], fill='white')
    
    # Draw left weight
    left_weight_x = bar_x1 - weight_size // 2
    left_weight_y = center_y - weight_size // 2
    draw.rectangle([left_weight_x, left_weight_y, 
                   left_weight_x + weight_size, left_weight_y + weight_size], 
                   fill='white')
    
    # Draw right weight
    right_weight_x = bar_x2 - weight_size // 2
    right_weight_y = center_y - weight_size // 2
    draw.rectangle([right_weight_x, right_weight_y,
                   right_weight_x + weight_size, right_weight_y + weight_size], 
                   fill='white')
    
    # Save the image
    img.save(filename, 'PNG')
    print(f'Created {filename}')

try:
    create_icon(192, 'icon-192.png')
    create_icon(512, 'icon-512.png')
    print('Icons created successfully!')
except Exception as e:
    print(f'Could not create icons: {e}')
    print('Using placeholder icons instead')
