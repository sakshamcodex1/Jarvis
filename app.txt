import streamlit as st
from openai import OpenAI

# 1. Set up the page layout
st.set_page_config(page_title="My Custom ChatGPT", page_icon="💬")
st.title("Custom ChatGPT Clone")

# 2. Securely get the OpenAI API Key from the user
api_key = st.sidebar.text_input("Enter OpenAI API Key", type="password")

if not api_key:
    st.info("Please add your OpenAI API key in the sidebar to continue.", icon="🔑")
    st.stop()

# 3. Initialize the OpenAI client
client = OpenAI(api_key=api_key)

# 4. Initialize chat history in the session state if it doesn't exist
if "messages" not in st.session_state:
    st.session_state.messages = [
        {"role": "system", "content": "You are a helpful assistant."}
    ]

# 5. Display past chat messages (skipping the hidden system prompt)
for message in st.session_state.messages:
    if message["role"] != "system":
        with st.chat_message(message["role"]):
            st.write(message["content"])

# 6. Handle new user input
if user_input := st.chat_input("What is on your mind?"):
    # Append and display user message
    st.session_state.messages.append({"role": "user", "content": user_input})
    with st.chat_message("user"):
        st.write(user_input)

    # Generate and display assistant response
    with st.chat_message("assistant"):
        response_placeholder = st.empty()
        
        # Call the API using the latest recommended model
        stream = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=st.session_state.messages,
            stream=True,  # Enables typewriter effect
        )
        
        # Stream the response text to the UI
        full_response = ""
        for chunk in stream:
            if chunk.choices[0].delta.content is not None:
                full_response += chunk.choices[0].delta.content
                response_placeholder.write(full_response)
        
        # Append assistant response to history
        st.session_state.messages.append({"role": "assistant", "content": full_response})
