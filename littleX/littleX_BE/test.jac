walker hype_man_pro {
    has input_text: str;
    
    can process with entry {
        report {"message": f"🔥 WOW! {self.input_text} 🚀"};
    }
}

with entry {
    spawn hype_man_pro(input_text="test") allow_root;
}