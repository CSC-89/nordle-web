using FluentAssertions;
using Wordle.Api.Controllers;

namespace Wordle.Tests;

public class WordleGameControllerTests
{
    [Fact]
    public async void Getword_returns_a_word()
    {
        WordleGameController controller = new();

        var result = controller.GetWordleAnswer();

        result.Should().NotBeNull();
        result.Should().NotBe("");
    }
}