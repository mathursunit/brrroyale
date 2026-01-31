from PIL import Image, ImageChops

def trim_and_transparent(input_path, output_path):
    img = Image.open(input_path)
    img = img.convert("RGBA")
    
    # Trim logic
    bg = Image.new(img.mode, img.size, (255, 255, 255, 255))
    diff = ImageChops.difference(img, bg)
    bbox = diff.getbbox()
    if bbox:
        img = img.crop(bbox)
    
    # Transparency logic
    datas = img.getdata()
    new_data = []
    for item in datas:
        # If pixel is near white (threshold 240)
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)
    
    img.putdata(new_data)
    img.save(output_path, "PNG")
    print(f"Processed image saved to {output_path}")

if __name__ == "__main__":
    trim_and_transparent("public/assets/logo-banner.png", "public/assets/logo-banner-trans.png")
