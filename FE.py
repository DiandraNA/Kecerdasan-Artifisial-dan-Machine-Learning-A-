import streamlit as st
from PIL import Image

def main():
    st.title("Image Viewer App")
    st.write("Upload two images to view them side by side")
      # Create two columns for side-by-side upload
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("First Image")
        img1_file = st.file_uploader("Upload first image", type=["jpg", "jpeg", "png"], key="img1")        # Show preview of first image if uploaded
        if img1_file is not None:
            img1 = Image.open(img1_file)
            st.image(img1, caption="Preview", use_container_width=True)
            st.write(f"Size: {img1.size[0]} x {img1.size[1]} pixels")
        
    with col2:
        st.subheader("Second Image")
        img2_file = st.file_uploader("Upload second image", type=["jpg", "jpeg", "png"], key="img2")        # Show preview of second image if uploaded
        if img2_file is not None:
            img2 = Image.open(img2_file)
            st.image(img2, caption="Preview", use_container_width=True)
            st.write(f"Size: {img2.size[0]} x {img2.size[1]} pixels")
    
    if img1_file is not None and img2_file is not None:
        # Display the uploaded images
        img1 = Image.open(img1_file)
        img2 = Image.open(img2_file)
        
        col1, col2 = st.columns(2)
        
        # Display image information
        st.subheader("Image Information")
        
        col1, col2 = st.columns(2)
        with col1:
            st.write("First Image:")
            st.write(f"Format: {img1.format}")
            st.write(f"Size: {img1.size[0]} x {img1.size[1]} pixels")
            st.write(f"Mode: {img1.mode}")
        
        with col2:
            st.write("Second Image:")
            st.write(f"Format: {img2.format}")
            st.write(f"Size: {img2.size[0]} x {img2.size[1]} pixels")
            st.write(f"Mode: {img2.mode}")

if __name__ == "__main__":
    main()