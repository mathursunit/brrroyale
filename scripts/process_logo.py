from PIL import Image

def trim_alpha(input_path, output_path):
    img = Image.open(input_path)
    img = img.convert("RGBA")
    
    # Trim based on alpha channel
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        print(f"Cropped to bbox: {bbox}")
    
    img.save(output_path, "PNG")
    print(f"Final trimmed image saved to {output_path}")

if __name__ == "__main__":
    # First, let's re-run the transparency logic but more aggressively
    def apply_transparency(path):
        img = Image.open(path).convert("RGBA")
        datas = img.getdata()
        new_data = []
        for item in datas:
            # More aggressive white removal (threshold 230)
            if item[0] > 230 and item[1] > 230 and item[2] > 230:
                new_data.append((255, 255, 255, 0))
            else:
                new_data.append(item)
        img.putdata(new_data)
        return img

    trans_img = apply_transparency("public/assets/logo-banner.png")
    trans_img.save("public/assets/logo-banner-trans.png")
    
    # Now trim the resulting transparent image
    trim_alpha("public/assets/logo-banner-trans.png", "public/assets/logo-banner-trans.png")
