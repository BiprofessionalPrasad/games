// Native desktop build entry point

#[macroquad::main("Borrow Dino")]
async fn main() {
    borrow_dino::main_macroquad().await;
}
