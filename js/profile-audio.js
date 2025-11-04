document.addEventListener('DOMContentLoaded', function() {
    const audioButton = document.querySelector('.audio-button');
    const audio = document.getElementById('profile-greeting');

    console.log('Audio button:', audioButton);
    console.log('Audio element:', audio);

    if (!audioButton || !audio) {
        console.error('Could not find audio button or audio element');
        return;
    }

    // Add click event listener to the audio button
    audioButton.addEventListener('click', function() {
        console.log('Audio button clicked');
        if (audio.paused) {
            // Play the audio
            audio.play().catch(function(error) {
                console.error('Error playing audio:', error);
            });
            audioButton.classList.add('playing');
            console.log('Playing audio');
        } else {
            // Pause the audio
            audio.pause();
            audio.currentTime = 0;
            audioButton.classList.remove('playing');
            console.log('Paused audio');
        }
    });

    // Remove playing class when audio ends
    audio.addEventListener('ended', function() {
        audioButton.classList.remove('playing');
        console.log('Audio ended');
    });
});